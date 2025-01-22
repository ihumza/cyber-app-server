const logger = require('../../lib/logger');
const Event = require('../models/events.model');
const { getUserIdFromAuthorization } = require('../services/user.service');

const createEvent = async (req, res) => {
  try {
    const { title, description, date, type, allowedUsers, location } = req.body;
    const host = await getUserIdFromAuthorization(req);
    const newEvent = await Event.create({
      title,
      description,
      date,
      host,
      type,
      location,
      allowedUsers,
    });
    return res.status(201).json({ status: true, data: newEvent });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const listEvents = async (req, res) => {
  const { query, offset, limit, startDate, endDate, status, location } =
    req.query;
  try {
    let filters = {};
    if (query && query.trim() !== '') {
      filters.$or = [
        { title: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
      ];
    }
    if (status) {
      filters.status = status;
    }
    if (location && location !== null && location !== 'null') {
      filters.location = location;
    }
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) {
        filters.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.date.$lte = new Date(endDate);
      }
    }

    const events = await Event.find(filters)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });
    return res.status(200).json({
      status: true,
      data: events,
      count: await Event.countDocuments(filters),
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findOne({ eventId: id });
    if (!event) {
      return res
        .status(404)
        .json({ status: false, message: 'Event not found' });
    }
    return res.status(200).json({ status: true, data: event });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, allowedUsers } = req.body;
  try {
    let payload = { title, description, date, allowedUsers };
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId: id },
      payload,
      { new: true }
    );
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ status: false, message: 'Event not found' });
    }
    return res.status(200).json({ status: true, data: updatedEvent });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await Event.findOneAndDelete({ eventId: id });
    if (!deletedEvent) {
      return res
        .status(404)
        .json({ status: false, message: 'Event not found' });
    }
    return res.status(200).json({ status: true, message: 'Event deleted' });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  listEvents,
  getEvent,
  deleteEvent,
  createEvent,
  updateEvent,
};
