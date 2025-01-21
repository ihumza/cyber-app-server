const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const { sanitizeString } = require('../utilities/functions');
const User = require('../models/user.model');
const { getUserFromAuthorization } = require('../services/user.service');

const listUsers = async (req, res) => {
  const { query, offset, limit, type } = req.query;
  let { deleted = false } = req.query;
  try {
    let filters = {};
    if (query && query.trim() !== '') {
      filters.$or = [
        { username: { $regex: query.trim(), $options: 'i' } },
        { name: { $regex: query.trim(), $options: 'i' } },
        { email: { $regex: query.trim(), $options: 'i' } },
      ];
    }

    if (type && type !== '') {
      filters.type = type;
    }
    const users = await User.find(filters)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    if (users.length > 0) {
      const response = {
        status: true,
        message: 'User List Found',
        data: users,
        count: await User.countDocuments(filters),
      };
      return res.status(200).json(response);
    } else {
      return res
        .status(404)
        .json({ status: false, message: 'No User List Found!' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Database Connection Error. Contact Webmaster!',
    });
  }
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  const { type } = req.body;
  try {
    let filters = { username: username };
    if (type) filters.type = type;
    const user = await User.findOne(filters).select('-password').lean();

    if (user) {
      const response = {
        status: true,
        message: 'User Found',
        data: user,
      };
      return res.status(200).json(response);
    } else {
      return res.status(404).json({ status: false, message: 'No User Found!' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Database Connection Error. Contact Webmaster!',
    });
  }
};

const addUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await check('name').notEmpty().withMessage('Name is required').run(req);
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
    await check('email')
      .isEmail()
      .withMessage('Valid email is required')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0].msg,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let username =
      name.toLowerCase().replace(/\s+/g, '').substring(0, 8) +
      Math.floor(Math.random() * 900) +
      100;

    let existingUser = await User.findOne({
      username: { $regex: username, $options: 'i' },
    });
    if (existingUser) {
      username += existingUser.length;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        status: false,
        message: 'User With Same Email is Already Added',
      });
    }

    let payload = {
      name,
      username,
      password: hashedPassword,
    };

    const newUser = new User(payload);
    await newUser.save();

    return res.status(201).json({
      status: true,
      message: 'User Added',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Database Connection Error. Contact Webmaster!',
    });
  }
};

const editProfile = async (req, res) => {
  const { userId, name, email, bio, birthdate, locations } = req.body;

  const validationPromises = [
    check('name').notEmpty().withMessage('Name is required').run(req),
    check('email').isEmail().withMessage('Valid email is required').run(req),
    check('bio')
      .optional()
      .isString()
      .withMessage('Bio should be a valid string')
      .run(req),
    check('birthdate')
      .optional()
      .isDate()
      .withMessage('Birthdate must be a valid date')
      .run(req),
    check('locations')
      .optional()
      .isString()
      .withMessage('Location should be a valid string')
      .run(req),
  ];

  await Promise.all(validationPromises);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Please enter all required fields.',
      errors: errors.array(),
    });
  }

  try {
    if (!userId) {
      return res
        .status(401)
        .json({ status: false, message: 'Unauthorized access' });
    }

    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email);

    const duplicateEmailUser = await User.findOne({
      email: sanitizedEmail,
      _id: { $ne: userId },
    });
    if (duplicateEmailUser) {
      return res.status(409).json({
        status: false,
        message: 'User with the same email already exists.',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: sanitizedName,
        email: sanitizedEmail,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        status: false,
        message: 'Failed to update your profile.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Profile Updated',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while updating your profile.',
    });
  }
};

const editUser = async (req, res) => {
  const { username, _id, nname, email } = req.body;

  try {
    const executioner = await getUserFromAuthorization(req);
    const host = await User.findOne({ username: username });
    const Authorization = await haveAuthorization(executioner?._id, host?._id);
    if (!Authorization) {
      return res.status(403).json({
        status: false,
        message: 'You are not authorized to update this user.',
      });
    }
    const query = {};
    if (username) query.username = username;
    if (_id) query._id = _id;
    if (email) query.email = email;

    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No valid identifier provided to locate the user.',
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      query,
      { ...req.body },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'User Updated',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Database Connection Error. Contact Webmaster!',
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const isSuperAdmin = await User.findOne({
      _id: id,
      type: 'super-admin',
    });
    if (isSuperAdmin) {
      return res.status(400).json({
        status: false,
        message: 'Super Admin cannot be deleted',
      });
    }
    const executioner = await getUserFromAuthorization(req);
    const host = await User.findById(id);
    const Authorization = await haveAuthorization(executioner?._id, host?._id);
    if (!Authorization) {
      return res.status(403).json({
        status: false,
        message: 'You are not authorized to delete this user.',
      });
    }

    const deletedUser = await User.findByIdAndUpdate(id, {
      deleted: true,
    });
    if (!deletedUser) {
      return res.status(404).json({
        status: false,
        message: 'User Not Found',
      });
    }

    if (deletedUser.photo) {
      const filePath = path.join(
        PUBLICUPLOADPATH,
        `img/user/${deletedUser.photo}`
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({
      status: true,
      message: 'User Deleted',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Database Connection Error. Contact Webmaster!',
    });
  }
};

module.exports = {
  listUsers,
  addUser,
  editProfile,
  editUser,
  deleteUser,
  getUserByUsername,
};
