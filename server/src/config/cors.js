var WHITELIST_DOMAIN = require("../utils/constants");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utils/ApiError.js");

const corsOptions = {
  origin: function (origin, callback) {
    // Kiểm tra dem origin có phải là domain được chấp nhận hay không
    if (WHITELIST_DOMAIN.includes(origin)) {
      return callback(null, true);
    }

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(
      new ApiError(
        StatusCodes.FORBIDDEN,
        `${origin} not allowed by our CORS Policy.`
      )
    );
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions };
