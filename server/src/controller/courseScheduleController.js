const courseScheduleModel = require("../model/courseScheduleModel");
const { StatusCodes } = require("http-status-codes");

const createNewCourseSchedule = async (req, res) => {
  try {
    const newCourseSchedule = req.body;
    const checkConflict = await courseScheduleModel.checkClassConfict(
      newCourseSchedule
    );
    if (checkConflict.conflict) {
      console.log(checkConflict.conflictSchedule);
      return res.status(StatusCodes.BAD_GATEWAY).json({
        error:
          "Trùng tiết học với phòng học khác!: " +
          checkConflict.conflictSchedule.courseId,
      });
    }
    const createdCourseSchedule =
      await courseScheduleModel.createNewCourseSchedule(newCourseSchedule);
    res.status(StatusCodes.CREATED).json(createdCourseSchedule);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getCourseSchedules = async (req, res) => {
  try {
    const courseSchedules = await courseScheduleModel.getCourseSchedule();
    res.status(StatusCodes.OK).json(courseSchedules);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getCourseSchedulesBySemester = async (req, res) => {
  try {
    const semesterId = req.params.semesterId;
    const courseSchedules =
      await courseScheduleModel.getCourseSchedulesBySemester(semesterId);
    res.status(StatusCodes.OK).json(courseSchedules);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const editCourseSchedule = async (req, res) => {
  try {
    const courseScheduleToEdit = req.body;
    const existingCourseSchedule = await courseScheduleModel.findOneById(
      courseScheduleToEdit._id
    );
    let noChangeInschedule = false;

    if (
      String(existingCourseSchedule.startPeriod) ===
        String(courseScheduleToEdit.startPeriod) &&
      String(existingCourseSchedule.endPeriod) ===
        String(courseScheduleToEdit.endPeriod) &&
      String(existingCourseSchedule.dayOfWeek) ===
        String(courseScheduleToEdit.dayOfWeek) &&
      String(existingCourseSchedule.roomNumber) ===
        String(courseScheduleToEdit.roomNumber)
    ) {
      noChangeInschedule = true;
    } else {
      noChangeInschedule = false;
    }
    if (!noChangeInschedule) {
      const checkConflict = await courseScheduleModel.checkClassConfict(
        courseScheduleToEdit
      );
      if (checkConflict.conflict) {
        return res.status(StatusCodes.BAD_GATEWAY).json({
          error:
            "Trùng tiết học với phòng học khác!: " +
            checkConflict.conflictSchedule.courseId,
        });
      }
    }

    // console.log(noChangeInschedule);
    if (courseScheduleToEdit.createAt) {
      courseScheduleToEdit.createAt = new Date().getTime();
    }
    const editedCourseSchedule = await courseScheduleModel.editCourseSchedule(
      courseScheduleToEdit
    );
    res.status(StatusCodes.OK).json(editedCourseSchedule);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteCourseSchedule = async (req, res) => {
  try {
    const courseScheduleToDetele = req.body;
    // console.log(req.body);
    const result = await courseScheduleModel.deleteCourseSchedule(
      courseScheduleToDetele
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const courseScheduleController = {
  createNewCourseSchedule,
  getCourseSchedules,
  editCourseSchedule,
  deleteCourseSchedule,
  getCourseSchedulesBySemester,
};

module.exports = courseScheduleController;
