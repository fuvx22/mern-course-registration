const {
  AddInstructor,
  getInstructor,
  editInstructor,
  deleteInstructor,
} = require("../model/instructorModel");
const { StatusCodes } = require("http-status-codes");
module.exports = {
  createNewInstructor: async (req, res, next) => {
    try {
      const instructorBody = req.body;
      const createInstructor = await AddInstructor(instructorBody);
      res.status(StatusCodes.CREATED).json(createInstructor);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  },
  getInstructor: async (req, res, next) => {
    try {
      const instructor = await getInstructor();
      res.status(StatusCodes.OK).json(instructor);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },
  editInstructorSelected: async (req, res, next) => {
    try {
      const instructorData = req.body;
      const { _id, ...rest } = instructorData;
      const newInstructor = await editInstructor(_id, rest);
      res.status(StatusCodes.OK).json(newInstructor);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },
  deleteInstructorSelected: async (req, res, next) => {
    try {
      const instructorId = req.params.id;
      const result = await deleteInstructor(instructorId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },
};
