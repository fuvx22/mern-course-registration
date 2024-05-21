const Joi = require("joi");
const { GET_DB } = require("../config/mongodb");
const { OBJECT_ID_RULES, OBJECT_ID_MESSAGE } = require("../utils/validators");
const { ObjectId } = require("mongodb");
const MAJOR_COLLECTION_NAME = "major";
const MAJOR_SCHEMA = Joi.object({
  majorId: Joi.string()
    .required()
    .min(6)
    .max(6)
    .pattern(/^[0-9]{6}$/)
    .trim()
    .strict(),
  name: Joi.string().required().min(3).max(60).trim().strict(),
  type: Joi.string().required().min(5).max(30).trim().strict(),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
});

const findOneById = async (id) => {
  try {
    const major = await GET_DB()
      .collection(MAJOR_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return major;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (data) => {
  try {
    const validData = await MAJOR_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const createdMajor = await GET_DB()
      .collection(MAJOR_COLLECTION_NAME)
      .insertOne(validData);
    const getNewMajor = await findOneById(createdMajor.insertedId);
    return getNewMajor;
  } catch (error) {
    throw new Error(error);
  }
};

const getMajors = async () => {
  try {
    return await GET_DB().collection(MAJOR_COLLECTION_NAME).find().toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const editMajor = async (data) => {
    try {
        const { _id, createAt, ...rest } = data;
        const validData = await MAJOR_SCHEMA.validateAsync(rest, {
            abortEarly: false,
        });
        //delete validData.createAt;
        const result = await GET_DB()
            .collection(MAJOR_COLLECTION_NAME)
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

const deleteMajor = async (majorToDelete) => {
  try {
    const result = await GET_DB()
      .collection(MAJOR_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(majorToDelete._id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const majorModel = {
  MAJOR_COLLECTION_NAME,
  createNew,
  getMajors,
  editMajor,
  deleteMajor,
  findOneById,
};

module.exports = majorModel;
