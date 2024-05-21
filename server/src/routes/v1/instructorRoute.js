const express = require("express");
const { StatusCodes } = require("http-status-codes");
const {
  createNewInstructor,
  getInstructor,
  editInstructorSelected,
  deleteInstructorSelected,
} = require("../../controller/instructorController");
const { verifyToken } = require("../../middlewares/verifyAccesToken");
const instructorRouter = express.Router();
instructorRouter
  .route("/")
  .post(verifyToken, createNewInstructor)
  .get(verifyToken, getInstructor);
instructorRouter.route("/edit").post(verifyToken, editInstructorSelected);
instructorRouter
  .route("/delete/:id")
  .delete(verifyToken, deleteInstructorSelected);
module.exports = {
  instructorRouter,
};
