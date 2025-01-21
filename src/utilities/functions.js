const sanitize = require('mongo-sanitize');
const path = require('path');
const fs = require('fs');
const transporter = require('../../config/email');
const { PUBLICUPLOADDIR } = require('./constants');
const apiUrl = process.env.API_URL;
const logger = require('../../lib/logger');
const smtpHost = process.env.SMTP_USER;

function cleanStr(string) {
  string = string.replace(/\s+/g, ''); // Replaces all spaces with an empty string.
  return string.replace(/[^A-Za-z0-9\-]/g, ''); // Removes special chars.
}

function strURL(text) {
  let returnText = '';
  const textArr = text.split(' ');

  textArr.forEach((value) => {
    const stringHasURL = value.includes('http') || value.includes('www.');

    if (stringHasURL) {
      returnText += `<a href="${value}" target="_blank">${value}</a> `;
    } else {
      returnText += value + ' ';
    }
  });

  return returnText.trim(); // Trim to remove trailing space
}

function appendKey(obj, key) {
  obj[key] = true;
  return obj;
}

function sanitizeString(str) {
  return sanitize(str.replace(/<script.*?>.*?<\/script>/g, ''));
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
    console.error('Error sending email:', error);
    return false;
  }
};

const saveFile = async (file, filePath, filename) => {
  try {
    console.log('Coming here');
    const fileExtension = file.originalname.split('.').pop();
    const fileName = filename ?? `${Date.now()}.${fileExtension}`;
    const serverDirectoryPath = path.join(PUBLICUPLOADDIR, filePath);
    const imageFilePath = path.join(PUBLICUPLOADDIR, `${filePath}/${fileName}`);
    if (!fs.existsSync(serverDirectoryPath)) {
      fs.mkdir(serverDirectoryPath, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
        } else {
        }
      });
    }
    fs.writeFileSync(imageFilePath, file.buffer);
    let imageUrl = `${filePath}/${fileName}`;
    const fileType = fileExtension;

    return {
      status: true,
      url: apiUrl + '/uploads' + imageUrl,
      fileType,
      name: file.originalname,
    };
  } catch (error) {
    return { status: false, message: error.message, url: '' };
  }
};

const saveFileFromBuffer = async (fileBuffer, filePath, filename) => {
  try {
    const fileExtension = filename.split('.').pop();
    const fileName = filename ?? `${Date.now()}.${fileExtension}`;
    const serverDirectoryPath = path.join(PUBLICUPLOADDIR, filePath);
    const imageFilePath = path.join(PUBLICUPLOADDIR, `${filePath}/${fileName}`);
    if (!fs.existsSync(serverDirectoryPath)) {
      fs.mkdirSync(serverDirectoryPath, { recursive: true });
    }
    fs.writeFileSync(imageFilePath, fileBuffer);
    let imageUrl = `${filePath}/${fileName}`;
    const fileType = fileExtension;

    return {
      status: true,
      url: apiUrl + '/uploads' + imageUrl,
      fileType,
      name: fileName,
    };
  } catch (error) {
    return { status: false, message: error.message, url: '' };
  }
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  cleanStr,
  saveFile,
  strURL,
  sanitizeString,
  sendEmail,
  isValidEmail,
  appendKey,
  saveFileFromBuffer,
};
