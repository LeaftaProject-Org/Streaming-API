const bcrypt = require("bcrypt");
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");

/**
 * @api {post} /auth/sign-up signup
 * @apiName signup
 * @apiGroup Auth
 *
 * @apiParam {String} email user email
 * @apiParam {String} username user username
 * @apiParam {String} password user password
 * @apiParam {String} repeatPassword repeated password
 *
 * @apiSuccess {String} message success message
 * @apiSuccess {String} token JWT token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User signed up successfully",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkNTQxZGNjZjViZDY1MWQxMmRjNzRlMiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.zS3__P2WkR5j37_n78_rKrVQbvqr6qwIqZZ_5Ta-yPs"
 *     }
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
 * @api {post} /auth/sign-in
 * @apiName signin
 * @apiGroup Auth
 *
 * @apiParam {String} email user email
 * @apiParam {String} password user password
 *
 * @apiSuccess {String} message success message
 * @apiSuccess {String} token JWT token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User logged in successfully",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkNTQxZGNjZjViZDY1MWQxMmRjNzRlMiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.zS3__P2WkR5j37_n78_rKrVQbvqr6qwIqZZ_5Ta-yPs"
 *     }
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