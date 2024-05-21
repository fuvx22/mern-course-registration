const Joi = require("joi");
const { GET_DB } = require("../config/mongodb");
const { OBJECT_ID_RULES, OBJECT_ID_MESSAGE } = require("../utils/validators");
const { ObjectId } = require("mongodb");
const INSTRUCTOR_COLLECTION_NAME = "instructor";
const INSTRUCTOR_SCHEMA = Joi.object({
  instructorId: Joi.string().required().min(5).max(10).trim().strict(),
  majorId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE),
  name: Joi.string().required().min(5).trim().strict(),
  degree: Joi.string().required().min(5).max(40).trim().strict(),
  email: Joi.string().required().min(5).trim().strict(),
});
module.exports = {
  AddInstructor: async (data) => {
    try {
      const validData = await INSTRUCTOR_SCHEMA.validateAsync(data, {
        abortEarly: false,
      });
      const createdInstructor = await GET_DB()
        .collection(INSTRUCTOR_COLLECTION_NAME)
        .insertOne(validData);
      const getInstructor = await GET_DB()
        .collection(INSTRUCTOR_COLLECTION_NAME)
        .findOne({ _id: createdInstructor.insertedId });
      return getInstructor;
    } catch (error) {
      throw new Error(error);
    }
  },
  getInstructor: async () => {
    try {
      const instructor = GET_DB()
        .collection(INSTRUCTOR_COLLECTION_NAME)
        .find()
        .toArray();
      return instructor;
    } catch (error) {
      throw new Error(error);
    }
  },
  editInstructor: async (id, data) => {
    try {
      const validData = await INSTRUCTOR_SCHEMA.validateAsync(data, {
        abortEarly: false,
      });
      const result = await GET_DB()
        .collection(INSTRUCTOR_COLLECTION_NAME)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: validData },
          { returnDocument: "after" }
        );
      return result;
    } catch (error) {
      throw new Error(error);
    }
  },
  deleteInstructor: async (id) => {
    try {
      const result = await GET_DB()
        .collection(INSTRUCTOR_COLLECTION_NAME)
        .deleteOne({
          _id: new ObjectId(id),
        });
      return result;
    } catch (error) {
      throw new Error(error);
    }
  },
};
