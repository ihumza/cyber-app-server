const sanitize = require("mongo-sanitize");
const transporter = require("../../config/email");
const logger = require("../../lib/logger");
const smtpHost = process.env.SMTP_USER;

function cleanStr(string) {
  string = string.replace(/\s+/g, ""); // Replaces all spaces with an empty string.
  return string.replace(/[^A-Za-z0-9\-]/g, ""); // Removes special chars.
}

function strURL(text) {
  let returnText = "";
  const textArr = text.split(" ");

  textArr.forEach((value) => {
    const stringHasURL = value.includes("http") || value.includes("www.");

    if (stringHasURL) {
      returnText += `<a href="${value}" target="_blank">${value}</a> `;
    } else {
      returnText += value + " ";
    }
  });

  return returnText.trim(); // Trim to remove trailing space
}

function appendKey(obj, key) {
  obj[key] = true;
  return obj;
}

function sanitizeString(str) {
  return sanitize(str.replace(/<script.*?>.*?<\/script>/g, ""));
}

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `O'Cyber<${smtpHost}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error(error.message);
    console.error("Error sending email:", error);
    return false;
  }
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  cleanStr,
  strURL,
  sanitizeString,
  sendEmail,
  isValidEmail,
  appendKey,
};
