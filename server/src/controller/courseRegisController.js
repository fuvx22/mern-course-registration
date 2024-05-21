const courseRegisModel = require("../model/courseRegisModel");
const { StatusCodes } = require("http-status-codes");
const metadata = require("../utils/metadata.json");
const fs = require('fs');


const getMetatdata = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json(metadata);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateMetadata = async (req, res) => {  
  try {
    const newMetadata = req.body;
    if (!newMetadata.currentSemesterId || newMetadata.isEnableCourseRegistration === undefined) throw new Error('Invalid metadata');
    fs.writeFileSync('src/utils/metadata.json', JSON.stringify(newMetadata));
    res.status(StatusCodes.OK).json(newMetadata);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const createNewCourseRegis = async (req, res) => {
  try {
    const newCourseRegis = req.body;
    const createdCourseRegis = await courseRegisModel.createNewCourseRegis(
      newCourseRegis
    );
    res.status(StatusCodes.CREATED).json(createdCourseRegis);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getCourseRegisByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const courseRegis = await courseRegisModel.getCourseRegisByUserId(userId);
    res.status(StatusCodes.OK).json(courseRegis);
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

const deleteCourseRegis = async (req, res) => {
  try {
    const courseRegisToDelete = req.body;
    const result = await courseRegisModel.deleteCourseRegis(
      courseRegisToDelete
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getTimeSchedule = async (req, res) => {
  try {
    const userId = req.params.userId;
    const semesterId = req.params.semesterId;
    const result = await courseRegisModel.getTimeSchedule(userId, semesterId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const courseRegisController = {
  createNewCourseRegis,
  getCourseRegisByUserId,
  deleteCourseRegis,
  getTimeSchedule,
  getMetatdata,
  updateMetadata,
};

module.exports = courseRegisController;
