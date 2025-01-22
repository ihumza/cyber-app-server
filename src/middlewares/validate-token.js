const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const User = require("../models/user.model");

const validateToken = async (req, res, next) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decodedToken = jwt.verify(accessToken, secret);
    const userId = decodedToken.id;
    const user = await User.findById(userId);
    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    return res.status(401).json({ status: false, message: error.message });
  }
};

module.exports = {
  validateToken,
};
