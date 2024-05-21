var express = require("express");
var cors = require("cors");
const { corsOptions } = require("./config/cors");
const { CONNECT_DB, GET_DB, CLOSE_DB } = require("./config/mongodb");
const API_V1 = require("./routes/v1/index");
const env = require("./config/environment");

PORT = env.PORT;

const START_SERVER = async () => {
  var app = express();
  try {
    // Kết nối với database
    console.log("Connecting to MongoDB cloud database");
    await CONNECT_DB();
    console.log("Connected to MongoDB cloud database");

    // enable req.body json data
    app.use(express.json());

    app.use(cors());

    // app.use(cors(corsOptions))

    app.get("/", function (req, res) {
      res.send("Ok!");
    });

    app.use("/v1", API_V1);

    app.listen(PORT, function () {
      console.log("Server is running at localhost:" + PORT);
    });
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
};

// Bắt sự kiện đóng server để ngắt kết nối với clound db
process.on("SIGINT", async () => {
  await CLOSE_DB(); // Đóng kết nối trước khi thoát
  console.log("Clound database connection closed");
  process.exit(0); // Thoát ứng dụng với mã thoát 0 (thành công)
});

START_SERVER();
