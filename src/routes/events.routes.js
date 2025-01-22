const {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/events.controller");
const sanitize = require("../middlewares/sanitize-body");

const router = require("express").Router();

router.route("/").get(listEvents);
router.route("/add").post(sanitize, createEvent);
router.route("/:id").get(getEvent);
router.route("/:id").put(sanitize, updateEvent);
router.route("/:id").delete(deleteEvent);

module.exports = router;
