const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { GET_DB } = require("../config/mongodb");
const SEMESTER_COLLLECTION_NAME = "semester";

const currentYear = new Date().getFullYear();
const yearRangeRegex = new RegExp(`^Học kỳ [123] Năm học \\d{4}-\\d{4}$`);

const SEMESTER_SCHEMA = Joi.object({
  semesterName: Joi.string().regex(yearRangeRegex).required(),
  startSemesterDate: Joi.date().default(Date.now).required(),
  endSemesterDate: Joi.date().default(Date.now).required(),
});

const findOneById = async (id) => {
  try {
    const semester = await GET_DB()
      .collection(SEMESTER_COLLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });

    return semester;
  } catch (error) {
    throw new Error(error);
  }
};

const createSemester = async (data) => {
  try {
    const validData = await SEMESTER_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const createdSemester = await GET_DB()
      .collection(SEMESTER_COLLLECTION_NAME)
      .insertOne(validData);
    const getNewSemester = await findOneById(createdSemester.insertedId);
    return getNewSemester;
  } catch (error) {
    throw new Error(error);
  }
};

const getSemester = async () => {
  try {
    return await GET_DB()
      .collection(SEMESTER_COLLLECTION_NAME)
      .find()
      .toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const editSemester = async (data) => {
  try {
    const { _id, ...rest } = data;
    const validData = await SEMESTER_SCHEMA.validateAsync(rest, {
      abortEarly: false,
    });
    const result = await GET_DB()
      .collection(SEMESTER_COLLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: validData },
        { returnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteSemester = async (semesterToDelete) => {
  try {
    const result = await GET_DB()
      .collection(SEMESTER_COLLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(semesterToDelete._id) });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const semesterModel = {
  findOneById,
  createSemester,
  getSemester,
  editSemester,
  deleteSemester,
};

module.exports = semesterModel;
