const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, "./public/image"); // Thư mục để lưu hình ảnh
    } else {
      cb(new Error("Không phải là hình ảnh"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  },
});
// console.log(upload);
const upload = multer({ storage: storage });

module.exports = { upload };
