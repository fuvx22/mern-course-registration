require("dotenv").config();

const env = {
  DATABASE_URI: process.env.DB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  PORT: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY,
};

module.exports = env;
