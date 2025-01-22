const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const User = require("../models/user.model");

const getUserFromAuthorization = async (req) => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) {
      return null;
    }
    const decodedToken = jwt.verify(accessToken, secret);
    const userId = decodedToken.id;
    const user = await User.findById(userId);

    return user;
  } catch (error) {
    return null;
  }
};

const getUserIdFromAuthorization = async (req) => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) {
      return null;
    }
    const decodedToken = jwt.verify(accessToken, secret);
    const userId = decodedToken.id;

    return userId;
  } catch (error) {
    return null;
  }
};

const getUserIdFromToken = async (accessToken) => {
  try {
    if (!accessToken) {
      return null;
    }
    const decodedToken = jwt.verify(accessToken, secret);
    const userId = decodedToken.id;

    return userId;
  } catch (error) {
    return null;
  }
};

const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({
      username: username,
    });
    return user;
  } catch (error) {
    return null;
  }
};

const getUsernameById = async (id) => {
  const user = await User.findById(id);
  return user.username;
};

const checkDuplicateUsername = async (username) => {
  const existingUser = await User.findOne({
    username: username,
  });
  return existingUser ? true : false;
};

const checkDuplicateEmail = async (email) => {
  const existingUser = await User.findOne({
    email: email,
  });
  return existingUser ? true : false;
};

module.exports = {
  getUserByUsername,
  getUsernameById,
  checkDuplicateUsername,
  checkDuplicateEmail,
  getUserFromAuthorization,
  getUserIdFromAuthorization,
  getUserIdFromToken,
};
