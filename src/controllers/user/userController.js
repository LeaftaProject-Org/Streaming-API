const UserModel = require("../../models/user");
const jwt = require("jsonwebtoken");



/**
 * Retrieves user data from the server based on the provided request.
 *
 * @param {Object} req - The request object containing the authorization token.
 * @param {Object} res - The response object used to send the user data.
 * @return {Promise<void>} - A promise that resolves when the user data is sent.
 */
exports.getUserData = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    res.json(user);
}