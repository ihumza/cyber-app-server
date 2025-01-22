const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      default: "Reminder for the event.",
    },
    sent: {
      type: Boolean,
      default: false,
    },
    reminderCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.pre("save", function (next) {
  if (!this.reminderCode) {
    // Generate a unique reminder code using timestamp and random string
    this.reminderCode = `REM-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
  }
  next();
});

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
