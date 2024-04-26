const UserModel = require("../models/user");

/**
 * Middleware to check if the user is an administrator.
 *
 * @param {Object} req - The request object, expecting req.user set by checkToken middleware.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} A Promise that resolves to the next middleware function if the user is an admin, or rejects with an error response if the user is not an admin.
 */
const checkAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user || user.role !== "ADMINISTRATOR") {
      return res.status(403).json({ message: "Access denied: Admin role required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error while verifying user role" });
  }
};

module.exports = checkAdmin;