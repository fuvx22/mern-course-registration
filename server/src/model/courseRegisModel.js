const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { GET_DB } = require("../config/mongodb");
const { OBJECT_ID_RULES, OBJECT_ID_MESSAGE } = require("../utils/validators");
const COURSE_REGIS_COLLECTION_NAME = "courseRegis";

const COURSE_REGIS_SCHEMA = Joi.object({
  courseScheduleId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE)
    .trim()
    .strict(),
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULES)
    .message(OBJECT_ID_MESSAGE)
    .trim()
    .strict(),
  createAt: Joi.date().timestamp("javascript").default(Date.now),
});

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(COURSE_REGIS_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw new Error(error);
  }
};

const createNewCourseRegis = async (data) => {
  try {
    const validData = await COURSE_REGIS_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });

    // check if courseScheduleId maxQuantity > 0
    const courseSchedule = await GET_DB()
      .collection("courseSchedule")
      .findOne({ _id: new ObjectId(validData.courseScheduleId) });

    if (courseSchedule.maxQuantity <= 0) {
      throw new Error("Course is full");
    }

    const createdCourseRegis = await GET_DB()
      .collection(COURSE_REGIS_COLLECTION_NAME)
      .insertOne(validData);

    await GET_DB()
      .collection("courseSchedule")
      .updateOne(
        { _id: new ObjectId(validData.courseScheduleId) },
        { $inc: { maxQuantity: -1 } }
      );

    const getNewCourseRegis = await findOneById(createdCourseRegis.insertedId);
    return getNewCourseRegis;
  } catch (error) {
    throw new Error(error);
  }
};

const getCourseRegisByUserId = async (userId) => {
  try {
    let result = await GET_DB()
      .collection(COURSE_REGIS_COLLECTION_NAME)
      .aggregate([
        { $match: { userId: userId } },
        { $set: { courseScheduleId: { $toObjectId: "$courseScheduleId" } } },
        {
          $lookup: {
            from: "courseSchedule",
            localField: "courseScheduleId",
            foreignField: "_id",
            as: "courseSchedule",
          },
        },
        {
          $unwind: {
            path: "$courseSchedule",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            "courseSchedule.courseId": {
              $toObjectId: "$courseSchedule.courseId",
            },
          },
        },
        {
          $lookup: {
            from: "course",
            localField: "courseSchedule.courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            "courseSchedule.instructorId": {
              $toObjectId: "$courseSchedule.instructorId",
            },
          },
        },
        {
          $lookup: {
            from: "instructor",
            localField: "courseSchedule.instructorId",
            foreignField: "_id",
            as: "instructor",
          },
        },
        {
          $unwind: {
            path: "$instructor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            createAt: 1,
            courseSchedule: 1,
            course: 1,
            "instructor.name": 1,
          },
        },
      ])
      .toArray();

    result = result.map((item) => {
      return {
        _id: item.courseSchedule._id,
        courseRegisId: item._id,
        createAt: item.createAt,
        dayOfWeek: item.courseSchedule.dayOfWeek,
        group: item.courseSchedule.group,
        period: item.courseSchedule.period,
        roomNumber: item.courseSchedule.roomNumber,
        semesterId: item.courseSchedule.semesterId,
        course: item.course,
        instructor: item.instructor,
      };
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteCourseRegis = async (courseRegisToDelete) => {
  try {
    const result = await GET_DB()
      .collection(COURSE_REGIS_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(courseRegisToDelete._id) });

    await GET_DB()
      .collection("courseSchedule")
      .updateOne(
        { _id: new ObjectId(courseRegisToDelete.courseScheduleId) },
        { $inc: { maxQuantity: +1 } }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getTimeSchedule = async (userId, semsterId) => {
  try {
    let result = await GET_DB()
      .collection(COURSE_REGIS_COLLECTION_NAME)
      .aggregate([
        { $match: { userId: userId } },
        { $set: { courseScheduleId: { $toObjectId: "$courseScheduleId" } } },
        {
          $lookup: {
            from: "courseSchedule",
            localField: "courseScheduleId",
            foreignField: "_id",
            as: "courseSchedule",
          },
        },
        {
          $match: {
            "courseSchedule.semesterId": semsterId,
          },
        },
        {
          $unwind: {
            path: "$courseSchedule",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            "courseSchedule.courseId": {
              $toObjectId: "$courseSchedule.courseId",
            },
          },
        },
        {
          $lookup: {
            from: "course",
            localField: "courseSchedule.courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            "course.semesterId": 1,
            "courseSchedule.period": 1,
            "course.name": 1,
            "courseSchedule.dayOfWeek": 1,
            "courseSchedule.roomNumber": 1,
          },
        },
        {
          $group: {
            _id: "$courseSchedule.dayOfWeek",
            schedule: { $push: "$$ROOT" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    let schedule = {
      "Thứ 2": [],
      "Thứ 3": [],
      "Thứ 4": [],
      "Thứ 5": [],
      "Thứ 6": [],
      "Thứ 7": [],
    };
    let hours = {
      1: new Date("2024-04-15T07:00:00"),
      2: new Date("2024-04-15T07:50:00"),
      3: new Date("2024-04-15T09:00:00"),
      4: new Date("2024-04-15T09:50:00"),
      5: new Date("2024-04-15T10:40:00"),
      6: new Date("2024-04-15T13:00:00"),
      7: new Date("2024-04-15T13:50:00"),
      8: new Date("2024-04-15T15:00:00"),
      9: new Date("2024-04-15T15:50:00"),
      10: new Date("2024-04-15T16:40:00"),
    };

    result.forEach((item) => {
      item.schedule = item.schedule.map((scheduleItem, i) => {
        lastIdx = scheduleItem.courseSchedule.period.length - 1;
        return {
          id: i + 1,
          type: "custom",
          name:
            scheduleItem.course.name +
            ", P." +
            scheduleItem.courseSchedule.roomNumber,
          startTime: hours[scheduleItem.courseSchedule.period[0]].getTime(),
          endTime:
            hours[scheduleItem.courseSchedule.period[lastIdx]].getTime() +
            50 * 60 * 1000,
        };
      });
      [schedule[item._id]] = [item.schedule];
    });

    return schedule;
  } catch (error) {
    throw new Error(error);
  }
};

const courseRegisModel = {
  createNewCourseRegis,
  getCourseRegisByUserId,
  deleteCourseRegis,
  getTimeSchedule,
};

module.exports = courseRegisModel;
