const bcrypt = require("bcrypt");
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");


/**
 * Sign up a new user with the provided email, username, password, and repeatPassword.
 *
 * @param {Object} req - The request object containing the user's email, username, password, and repeatPassword.
 * @param {Object} res - The response object used to send the sign-up result.
 * @return {Promise<void>} - A promise that resolves when the sign-up is complete.
 */
exports.signup = async (req, res) => {
  const { email, username, password, repeatPassword } = req.body;

  if (!email || !username || !password || !repeatPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!password || !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
    return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ email, username, password: hashedPassword });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email, username: newUser.username }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({ message: "User signed up successfully", token });
  } catch (error) {
    console.error("An error occurred during signup:", error);
    return res.status(500).json({ message: "An error occurred during signup" });
  }
};


/**
 * Sign in a user with the provided email and password.
 *
 * @param {Object} req - The request object containing the user's email and password.
 * @param {Object} res - The response object used to send the sign-in result.
 * @return {Promise<void>} - A promise that resolves when the sign-in is complete.
 */
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!password || !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    });
  }

  try {

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    return res.status(500).json({ message: `An error occurred during login ${error}`});
  }
}