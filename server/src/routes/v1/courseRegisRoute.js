const express = require("express");
const courseRegisController = require("../../controller/courseRegisController");
const { verifyToken } = require("../../middlewares/verifyAccesToken");
const metadata = require("../../utils/metadata");

const courseRegisRouter = express.Router();

courseRegisRouter.use(verifyToken);

const checkIsEnableRegis = async (req, res, next) => {
  if (!metadata.isEnableCourseRegistration) {
    res.status(403).json({ message: "Registration is closed" });
  } else {
    next();
  }
};

courseRegisRouter
  .route("/")
  .post(checkIsEnableRegis, courseRegisController.createNewCourseRegis)
  .delete(checkIsEnableRegis, courseRegisController.deleteCourseRegis);
courseRegisRouter
  .route("/:userId")
  .get(courseRegisController.getCourseRegisByUserId);
courseRegisRouter
  .route("/time/:userId/:semesterId")
  .get(courseRegisController.getTimeSchedule);
courseRegisRouter
  .route("/metadata/config")
  .get(courseRegisController.getMetatdata)
  .put(courseRegisController.updateMetadata);

module.exports = {
  courseRegisRouter,
};
