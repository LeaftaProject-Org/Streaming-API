const UserModel = require('../../models/user');
const bcrypt = require('bcrypt');

/**
 * Retrieves all users from the database and sends them as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
exports.getAllUser = async(req, res) => {
  const users = await UserModel.find();

  if (!users) {
    return res.status(404).json({ message: 'No users found' });
  };

  res.status(200).json(users);
}

/**
 * Retrieves a user from the database based on the provided ID and sends it as a JSON response.
 *
 * @param {Object} req - The request object containing the user ID in the query.
 * @param {Object} res - The response object used to send the user data.
 * @return {Promise<void>} - A promise that resolves when the user data is sent.
 */
exports.getUser = async(req, res) => {
  const { id } = req.query;
  
  const user = await UserModel.findById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  };

  res.status(200).json(user);
}

/**
 * Updates user information based on the provided data.
 *
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object used to send the update result.
 * @return {Promise<void>} - A promise that resolves when the user information is updated.
 */
exports.editUser = async(req, res) => {
  const { id } = req.query;
  
  const { email, username, role, password, isVerified } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'All fields are required' });
  };

  const user = await UserModel.findById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  };

  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    };
    user.email = email;
  };

  if (username) {
    user.username = username;
  };

  if (role) {
    user.role = role;
  };

  if (password ) {
    if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  };

  if (isVerified) {
    user.isVerified = isVerified;
  };

  await user.save();

  res.status(200).json({ message: 'User updated successfully' });
}