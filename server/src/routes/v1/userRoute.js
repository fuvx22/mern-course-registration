const { StatusCodes } = require("http-status-codes");
var jwt = require("jsonwebtoken");
const { upload } = require("../../middlewares/multerConfig");
const {
  createNewUser,
  loginUser,
  getUserById,
  getImageUser,
  getAllUser,
  deleteUserSelected,
  updateUserById,
  changePassword,
} = require("../../controller/userController");
const { verifyToken } = require("../../middlewares/verifyAccesToken");
var express = require("express");

const userRouter = express.Router();
// userRouter.route("/").post(createNewUser);
userRouter.post("/", upload.single("image"), verifyToken, createNewUser);
userRouter.get("/role/:role", verifyToken, getAllUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/delete/:id").delete(verifyToken, deleteUserSelected);
userRouter.route("/userBoard").get(verifyToken, getUserById);
userRouter.get("/getimg/:img", getImageUser);
userRouter.put("/update-password/:id", verifyToken, changePassword);
userRouter.put("/update", upload.single("image"), verifyToken, updateUserById);
module.exports = {
  userRouter,
};
