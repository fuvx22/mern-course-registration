const courseModel = require("../model/courseModel");
const { StatusCodes } = require("http-status-codes");

const createNew = async (req, res) => {
  try {
    const newCourse = req.body;
    const createdCourse = await courseModel.createNew(newCourse);
    res.status(StatusCodes.CREATED).json(createdCourse);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await courseModel.getCourses();
    res.status(StatusCodes.OK).json(courses);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const editCourse = async (req, res) => {
  try {
    const courseToEdit = req.body;
    const editedCourse = await courseModel.editCourse(courseToEdit);
    res.status(StatusCodes.OK).json(editedCourse);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const courseToDetele = req.body;
    console.log(req.body);
    const result = await courseModel.deleteCourse(courseToDetele);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const courseController = {
  createNew,
  getCourses,
  editCourse,
  deleteCourse,
};

module.exports = courseController;
