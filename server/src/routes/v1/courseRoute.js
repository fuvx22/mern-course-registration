var express = require("express");
const courseController = require("../../controller/courseController");
const { verifyToken } = require("../../middlewares/verifyAccesToken");
const courseRouter = express.Router();

courseRouter
  .route("/")
  .post(verifyToken, courseController.createNew)
  .get(verifyToken, courseController.getCourses);

courseRouter.route("/edit")
  .put(courseController.editCourse)

courseRouter.route("/delete")
  .delete(courseController.deleteCourse)

module.exports = {
  courseRouter,
};
