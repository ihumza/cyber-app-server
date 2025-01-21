const mongoose = require("mongoose");
const logger = require("../lib/logger");
const uri = process.env.DB_URL;

const mongoConnection = async () => {
  try {
    await mongoose.connect(uri).then(async () => {
      console.log("Database connected successfully");
    });
  } catch (error) {
    logger.error(error.message);
    console.log(error);
  }
};
module.exports = mongoConnection;
