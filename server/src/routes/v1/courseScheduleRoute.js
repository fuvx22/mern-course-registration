var express = require("express");
const { StatusCodes } = require("http-status-codes");
const courseScheduleController = require("../../controller/courseScheduleController");
const { verifyToken } = require("../../middlewares/verifyAccesToken");
const courseScheduleRouter = express.Router();

courseScheduleRouter
  .route("/")
  .post(verifyToken, courseScheduleController.createNewCourseSchedule)
  .get(verifyToken, courseScheduleController.getCourseSchedules);

courseScheduleRouter
  .route("/edit")
  .put(courseScheduleController.editCourseSchedule);

courseScheduleRouter
  .route("/delete")
  .delete(courseScheduleController.deleteCourseSchedule);

courseScheduleRouter
  .route("/:semesterId")
  .get(verifyToken, courseScheduleController.getCourseSchedulesBySemester);

module.exports = {
  courseScheduleRouter,
};
