const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { GET_DB } = require("../config/mongodb");
const { OBJECT_ID_RULES, OBJECT_ID_MESSAGE } = require("../utils/validators");
const COURSE_SCHEDULE_COLLECTION_NAME = "courseSchedule";

const COURSE_SCHEDULE_SCHEMA = Joi.object({
  courseId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE),
  instructorId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE),
  semesterId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE),
  // dayOfWeek: Joi.string().required().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
  dayOfWeek: Joi.string()
    .required()
    .valid("Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"),
  startPeriod: Joi.number().min(1).max(10).required(),
  endPeriod: Joi.number().min(1).max(10).required(),
  period: Joi.array()
    .items(Joi.number().integer().min(1).max(10))
    .min(1)
    .max(10)
    .unique()
    .required(), // Lưu số tiết học trong một ngày dưới dạng mảng
  group: Joi.string().min(2).max(2).required(),
  roomNumber: Joi.string().required().min(3).max(15),
  maxQuantity: Joi.number().required().min(1).max(100).integer(),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
});

const findOneById = async (id) => {
  try {
    const courseSchedule = await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return courseSchedule;
  } catch (error) {
    throw new Error(error);
  }
};

const createNewCourseSchedule = async (data) => {
  try {
    const validData = await COURSE_SCHEDULE_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const createdCourseSchedule = await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
      .insertOne(validData);

    const getNewCourseSchedule = await findOneById(
      createdCourseSchedule.insertedId
    );
    return getNewCourseSchedule;
  } catch (error) {
    throw new Error(error);
  }
};
const checkClassConfict = async (newcourseSchedule) => {
  try {
    const CheckConflict = await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
      .findOne({
        dayOfWeek: newcourseSchedule.dayOfWeek,
        roomNumber: newcourseSchedule.roomNumber,
        semesterId: newcourseSchedule.semesterId,
        period: { $in: newcourseSchedule.period },
        _id: { $ne: new ObjectId(newcourseSchedule._id) },
      });
    if (CheckConflict) {
      return {
        conflict: true,
        conflictSchedule: CheckConflict,
      };
    } else {
      return {
        conflict: false,
      };
    }
  } catch (error) {
    throw new Error(error);
  }
};
const getCourseSchedule = async () => {
  try {
    return await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
      .find()
      .toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const getCourseSchedulesBySemester = async (semesterId) => {
  try {
    return await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
      .aggregate([
        { $set: { courseId: { $toObjectId: "$courseId" } } },
        { $set: { instructorId: { $toObjectId: "$instructorId" } } },
        { $match: { semesterId: semesterId } },
        {
          $lookup: {
            from: "course",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $lookup: {
            from: "instructor",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructor",
          },
        },
        { $unwind: "$instructor" },
      ])
      .toArray();
  } catch (error) {
    throw new Error(error);
  }
};

const editCourseSchedule = async (data) => {
  try {
    const { _id, creatAt, ...rest } = data;
    const validData = await COURSE_SCHEDULE_SCHEMA.validateAsync(rest, {
      abortEarly: false,
    });
    const result = await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
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

const deleteCourseSchedule = async (courseScheduleToDelete) => {
  try {
    const result = await GET_DB()
      .collection(COURSE_SCHEDULE_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(courseScheduleToDelete._id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const courseScheduleModel = {
  findOneById,
  createNewCourseSchedule,
  checkClassConfict,
  getCourseSchedule,
  editCourseSchedule,
  deleteCourseSchedule,
  getCourseSchedulesBySemester,
};

module.exports = courseScheduleModel;
