const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const User = require('../models/user.model');
const { sendEmail, isValidEmail, saveFile } = require('../utilities/functions');

const logger = require('../../lib/logger');
const { IMGUPLOADPATHLive } = require('../utilities/constants');
const {
  getUserByUsername,
  getUserIdFromAuthorization,
  getUserFromAuthorization,
} = require('../services/user.service');

const login = async (req, res) => {
  const { email, password } = req.body;

  await check('email').notEmpty().withMessage('Email is required').run(req);
  await check('password')
    .notEmpty()
    .withMessage('Password is required')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Please enter all required fields.',
      errors: errors.array(),
    });
  }

  try {
    let user;
    user = await User.findOne({
      email: email,
    }).lean();

    if (!user) {
      return res.status(401).json({ status: false, message: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid Username or Password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '4h',
    });
    let returnUserObj = user;
    delete returnUserObj.password;
    return res.status(200).json({
      status: true,
      message: 'Logged In Successfully',
      data: returnUserObj,
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  const { name, email, password, birthdate } = req.body;

  await check('name').notEmpty().withMessage('First name is required').run(req);
  await check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .run(req);
  await check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)
    .withMessage(
      'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character'
    )
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Please enter all required fields.',
      errors: errors.array(),
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  let username =
    name.toLowerCase().replace(/\s+/g, '').substring(0, 8) +
    Math.floor(Math.random() * 900) +
    100; // Generate username

  try {
    // Check if the email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        status: false,
        message: 'User with the same email already exists.',
      });
    }

    let usernameExists = await getUserByUsername(username);
    let count = 1;
    while (usernameExists) {
      username = username + count; // Append count to username if it exists
      usernameExists = await getUserByUsername(username);
      count++;
    }

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      status: true,
      message: 'Account Created Successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const file = req.file;
  await check('name').notEmpty().withMessage('First Name is required').run(req);
  await check('email')
    .notEmpty()
    .withMessage('Email password is required')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Please enter all required fields.',
      errors: errors.array(),
    });
  }

  try {
    // Find the user by ID
    const user = await getUserFromAuthorization(req);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found.',
      });
    }
    let profileData = req.body;
    if (file) {
      const fileSaved = await saveFile(file, '/profile');
      if (fileSaved.status === 'success') {
        profileData.photo = fileSaved.url;
      }
    }
    delete profileData.twoStepVerification;
    delete profileData.twoStepVerificationType;
    delete profileData.twoStepVerificationCode;
    delete profileData.twoStepVerificationCodeExpiry;
    delete profileData.twoStepVerificationCodeCount;
    const response = await User.findByIdAndUpdate(user?._id, profileData, {
      new: true,
      select: '-password',
    }).lean();
    if (!response) {
      return res.status(500).json({
        status: false,
        message: 'Something went wrong.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Profile updated successfully.',
      data: response,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  await check('name').notEmpty().withMessage('First Name is required').run(req);
  await check('email')
    .notEmpty()
    .withMessage('Email password is required')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Please enter all required fields.',
      errors: errors.array(),
    });
  }

  let profileData = req.body;
  console.log(profileData);
  const file = req.file;
  console.log(file);

  try {
    // Find the user by ID
    const executioner = await getUserFromAuthorization(req);
    let filters = { username: profileData?.username };
    const user = await User.findOne(filters).select('-password').lean();
    if (!user) {
      return res.json({
        status: false,
        message: 'User not found.',
      });
    }

    if (file) {
      const fileSaved = await saveFile(file, '/profile');
      console.log(fileSaved);
      if (fileSaved.status === 'success') {
        profileData.photo = fileSaved.url;
      }
    }

    const response2 = await User.findByIdAndUpdate(user?._id, profileData, {
      new: true,
      select: '-password',
    }).lean();
    if (!response2) {
      return res.json({
        status: false,
        message: 'Something went wrong.',
      });
    }
    let response = await User.findById(response2?._id);
    await response.save();

    return res.json({
      status: true,
      message: 'Profile updated successfully.',
      data: response,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      status: false,
      message: err.message,
    });
  }
};

const fetchProfile = async (req, res) => {
  try {
    const userId = await getUserIdFromAuthorization(req);
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: 'User not found or inactive' });
    }
    return res
      .status(200)
      .json({ status: true, message: 'User found', data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  register,
  fetchProfile,
  updateProfile,
  updateUserProfile,
};
