// logger.js
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // new transports.Console(),
    new transports.File({ filename: "app.log" }),
    new transports.File({ filename: "error.log", level: "error" }), // Separate file for errors
  ],
  exceptionHandlers: [
    new transports.File({ filename: "exceptions.log" }), // Log uncaught exceptions
  ],
});

module.exports = logger;
