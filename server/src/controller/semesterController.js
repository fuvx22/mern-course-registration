const semesterModel = require("../model/semesterModel");
const { StatusCodes } = require("http-status-codes");

const createSemester = async (req, res) => {
  try {
    const newSemester = req.body;
    const createdSemester = await semesterModel.createSemester(newSemester);
    res.status(StatusCodes.CREATED).json(createdSemester);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getSemester = async (req, res) => {
  try {
    const semester = await semesterModel.getSemester();
    res.status(StatusCodes.OK).json(semester);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const editSemester = async (req, res) => {
  try {
    const semesterToEdit = req.body;
    const editedSemester = await semesterModel.editSemester(semesterToEdit);
    res.status(StatusCodes.OK).json(editedSemester);
  } catch (error) {
    req
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteSemester = async (req, res) => {
  try {
    const semesterToDelete = req.body;
    console.log(req.body);
    const result = await semesterModel.deleteSemester(semesterToDelete);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const findOneById = async (req, res) => {
  try {
    const semester = await semesterModel.findOneById(req.params.id);
    res.status(StatusCodes.OK).json(semester);
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

const semesterController = {
  createSemester,
  getSemester,
  editSemester,
  deleteSemester,
  findOneById,
};

module.exports = semesterController;
