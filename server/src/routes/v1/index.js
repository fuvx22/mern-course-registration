const { StatusCodes } = require("http-status-codes");
var express = require("express");
const { userRouter } = require("./userRoute");
const { courseRouter } = require("./courseRoute");
const { instructorRouter } = require("./instructorRoute");
const { majorRouter } = require("./majorRoute");
const { courseScheduleRouter } = require("./courseScheduleRoute");
const { semesterRouter } = require("./semesterRoute");
const { notifyRouter } = require("./notifyRoute")
const { courseRegisRouter } = require("./courseRegisRoute");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(StatusCodes.UNAUTHORIZED).json({ message: "Test message" });
});

router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: "APIs v1 are ready to use" });
});

router.use("/user", userRouter);
router.use("/course", courseRouter);
router.use("/instructor", instructorRouter);
router.use("/major", majorRouter);
router.use("/courseSchedule", courseScheduleRouter);
router.use("/semester", semesterRouter);
router.use("/notify", notifyRouter);
router.use("/course-regis", courseRegisRouter);



module.exports = router;
