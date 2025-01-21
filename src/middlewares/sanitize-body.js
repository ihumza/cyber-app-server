const validator = require("validator");

// Function to recursively sanitize an object
const sanitizeObject = (obj) => {
  if (!obj) return; // Check if obj is undefined or null and return early if true
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string") {
      obj[key] = validator.escape(obj[key]); // Escape HTML entities to prevent XSS
      obj[key] = validator.trim(obj[key]); // Trim white spaces
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]); // Recursively sanitize nested objects
    }
  });
};

// Middleware function to sanitize req.body
const sanitize = (req, res, next) => {
  try {
    if (req.body) {
      sanitizeObject(req.body); // Sanitize the body recursively
    }
    next();
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
};

// Export the middleware to use in your routes
module.exports = sanitize;
