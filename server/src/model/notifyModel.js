const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { GET_DB } = require("../config/mongodb");
const { OBJECT_ID_RULES, OBJECT_ID_MESSAGE } = require("../utils/validators");
const NOTIFY_COLLECTION_NAME = "notify";

const NOTIFY_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(100).trim().strict(),
  content: Joi.string().required().min(3),
  authorId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
});

const findOneById = async (id) => {
  try {
    const notify = await GET_DB()
      .collection(NOTIFY_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return notify;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (data) => {
  try {
    const validData = await NOTIFY_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const createdNotify = await GET_DB()
      .collection(NOTIFY_COLLECTION_NAME)
      .insertOne(validData);
    const getNewNotify = await findOneById(createdNotify.insertedId);
    return getNewNotify;
  } catch (error) {
    throw new Error(error);
  }
};

const getNotifies = async () => {
  try {
    return await GET_DB()
      .collection(NOTIFY_COLLECTION_NAME)
      .aggregate([
        {
          $set: {
            authorId: { $toObjectId: "$authorId" }, // Chuyển đổi kiểu dữ liệu của trường authorId từ string sang ObjectId
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
      ])
      .toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const editNotify = async (data) => {
  try {
    const { _id, ...rest } = data;
    const validData = await NOTIFY_SCHEMA.validateAsync(rest, {
      abortEarly: false,
    });
    delete validData.createAt;
    const result = await GET_DB()
      .collection(NOTIFY_COLLECTION_NAME)
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

const deleteNotify = async (NotifyToDetele) => {
  try {
    const result = await GET_DB()
      .collection(NOTIFY_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(NotifyToDetele._id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const notifyModel = {
  createNew,
  getNotifies,
  editNotify,
  deleteNotify,
  findOneById,
};

module.exports = notifyModel;
