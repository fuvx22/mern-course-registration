const Joi = require("joi");
const { GET_DB } = require("../config/mongodb");
const { OBJECT_ID_RULES, OBJECT_ID_MESSAGE } = require("../utils/validators");
const USER_COLLECTION_NAME = "user";
const { ObjectId, ReturnDocument } = require("mongodb");
const { MAJOR_COLLECTION_NAME } = require("../model/majorModel");
const USER_SCHEMA = Joi.object({
  userId: Joi.string().required().min(5).max(10).trim().strict(),
  name: Joi.string().required().min(5).trim().strict(),
  image: Joi.string().required().min(5).trim().strict(),
  role: Joi.string().required().min(5).max(50).trim().strict(),
  password: Joi.string().required().min(10).trim().strict(),
  phoneNumber: Joi.string().required().min(10).max(11).trim().strict(),
  ethnic: Joi.string().default("Kinh").trim().strict(),
  religion: Joi.string().default("Không").trim().strict(),
  address: Joi.string().required().trim().min(5).strict(),
  class: Joi.string().required().trim().min(5).strict().allow("not-student"),
  AcademicAdvisor: Joi.string()
    .min(5)
    .required()
    .trim()
    .strict()
    .allow("not-student"),
  majorId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE)
    .allow("not-student"),
  specializedMajor: Joi.string().min(5).trim().strict().allow("not-student"),
  academicYear: Joi.string()
    .min(3)
    .trim()
    .strict()
    .message("Sai định dạng niên khóa!")
    .allow("not-student"),
});
const findUserByObjectId = async (id) => {
  try {
    const user = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
const createNew = async (data) => {
  try {
    const validData = await USER_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const createdUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validData);
    const userInserted = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: createdUser.insertedId });
    return userInserted;
  } catch (error) {
    throw new Error(error);
  }
};
const findUserById = async (userId) => {
  try {
    const userID = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ userId: userId });
    return userID;
  } catch {
    throw new Error("Invalid UserId");
  }
};
const findUserByRole = async (role) => {
  try {
    const userByRole = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .aggregate([
        { $match: { role: role } },
        {
          $lookup: {
            from: MAJOR_COLLECTION_NAME,
            localField: "majorId",
            foreignField: "_id",
            as: "majorData",
          },
        },
      ])
      .toArray();
    return userByRole;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteUserById = async (userId) => {
  try {
    const deleteUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(userId),
      });
    return deleteUser;
  } catch (error) {
    throw new Error(error.message);
  }
};
const editUserById = async (id, data) => {
  try {
    const validData = await USER_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const userEdited = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: validData },
        { ReturnDocument: "after" }
      );
    return userEdited;
  } catch (error) {
    throw new Error(error.message);
  }
};
const editPassword = async (id, newpass) => {
  try {
    const passwordEdited = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { userId: id },
        { $set: { password: newpass } },
        { ReturnDocument: "after" }
      );
    return passwordEdited;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createNew,
  findUserByObjectId,
  findUserById,
  findUserByRole,
  deleteUserById,
  editUserById,
  editPassword,
};
