const { model, Schema } = require("mongoose");

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
    },
    eventId: {
      type: String,
      unique: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    allowedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

eventSchema.pre("save", function (next) {
  if (!this.eventId) {
    this.eventId = `EVT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
  }
  next();
});

const Event = model("Event", eventSchema);

module.exports = Event;
