const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const { sanitizeString } = require("../utilities/functions");
const Reminder = require("../models/reminders.model");

const listReminders = async (req, res) => {
  const { query, offset, limit } = req.query;
  try {
    let filters = {};
    if (query && query.trim() !== "") {
      filters.$or = [{ email: { $regex: query.trim(), $options: "i" } }];
    }

    const reminders = await Reminder.find(filters)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    if (reminders.length > 0) {
      const response = {
        status: true,
        message: "Reminder List Found",
        data: reminders,
        count: await Reminder.countDocuments(filters),
      };
      return res.status(200).json(response);
    } else {
      return res
        .status(404)
        .json({ status: false, message: "No Reminder List Found!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Database Connection Error. Contact Webmaster!",
    });
  }
};

const addReminder = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await check("event").notEmpty().withMessage("Event is required").run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()[0].msg,
      });
    }

    let payload = {
      name,
      username,
    };

    const newReminder = new Reminder(payload);
    await newReminder.save();

    return res.status(201).json({
      status: true,
      message: "Reminder Added",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Database Connection Error. Contact Webmaster!",
    });
  }
};

const editProfile = async (req, res) => {
  const { userId, name, email } = req.body;

  const validationPromises = [
    check("name").notEmpty().withMessage("Name is required").run(req),
    check("email").isEmail().withMessage("Valid email is required").run(req),
  ];

  await Promise.all(validationPromises);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Please enter all required fields.",
      errors: errors.array(),
    });
  }

  try {
    if (!userId) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized access" });
    }

    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email);

    const duplicateEmailReminder = await Reminder.findOne({
      email: sanitizedEmail,
      _id: { $ne: userId },
    });
    if (duplicateEmailReminder) {
      return res.status(409).json({
        status: false,
        message: "Reminder with the same email already exists.",
      });
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(
      userId,
      {
        name: sanitizedName,
        email: sanitizedEmail,
      },
      { new: true }
    );

    if (!updatedReminder) {
      return res.status(500).json({
        status: false,
        message: "Failed to update your profile.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile Updated",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "An error occurred while updating your profile.",
    });
  }
};

const editReminder = async (req, res) => {
  const { username, _id, name, email } = req.body;

  try {
    const filters = {};
    if (username) filters.username = username;
    if (_id) filters._id = _id;
    if (email) filters.email = email;

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid identifier provided to identify the reminder.",
      });
    }

    const updatedReminder = await Reminder.findOneAndUpdate(
      filters,
      { ...req.body },
      { new: true }
    ).select("-password");

    if (!updatedReminder) {
      return res.status(404).json({
        status: false,
        message: "Reminder not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Reminder Updated",
      data: updatedReminder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Database Connection Error. Contact Webmaster!",
    });
  }
};

const deleteReminder = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReminder = await Reminder.findByIdAndUpdate(id, {
      deleted: true,
    });
    if (!deletedReminder) {
      return res.status(404).json({
        status: false,
        message: "Reminder Not Found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Reminder Deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Database Connection Error. Contact Webmaster!",
    });
  }
};

module.exports = {
  listReminders,
  addReminder,
  editProfile,
  editReminder,
  deleteReminder,
};
