const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");


/**
 * @api {get} /user/data/fetch Get User Data
 * @apiName GetUserData
 * @apiGroup User
 *
 * @apiHeader {String} Authorization JWT Token
 *
 * @apiSuccess {Object} user User data
 * @apiSuccess {String} user._id User ID
 * @apiSuccess {String} user.username User username
 * @apiSuccess {String} user.email User email
 * @apiSuccess {Date} user.createdAt Timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "5db0296555a9d30017f549b6",
 *       "username": "Psych",
 *       "email": "psych.killer@gmail.com",
 *       "createdAt": "2019-11-03T22:02:36.939Z",
 *     }
 *
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