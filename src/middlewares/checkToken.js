const jwt = require("jsonwebtoken");

/**
 * Middleware function to check the validity of a JWT token in the request headers.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} A Promise that resolves to the next middleware function if the token is valid, or rejects with an error response if the token is not valid or not present.
 */
module.exports = function (req, res, next) {
  const token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = decoded;

    next();
  });
};
