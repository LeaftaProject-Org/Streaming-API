
/**
 * Retrieves all users from the database and sends them as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
exports.getAllUser = async(req, res) => {
  const users = await UserModel.find();
  res.status(200).json(users);
}

