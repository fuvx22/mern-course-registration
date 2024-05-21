const notifyModel = require("../model/notifyModel");
const { StatusCodes } = require("http-status-codes");

const createNew = async (req, res) => {
  try {
    const newNotify = req.body;
    const createdNotify = await notifyModel.createNew(newNotify);
    res.status(StatusCodes.CREATED).json(createdNotify);
  } catch (error) {
    res.status(StatusCodes.PRECONDITION_FAILED).json({ error: error.message });
  }
};

const getNotifies = async (req, res) => {
  try {
    const notifies = await notifyModel.getNotifies();
    res.status(StatusCodes.OK).json(notifies);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const editNotify = async (req, res) => {
  try {
    const notifyToEdit = req.body;
    const editedNotify = await notifyModel.editNotify(notifyToEdit);
    res.status(StatusCodes.OK).json(editedNotify);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteNotify = async (req, res) => {
  try {
    const NotifyToDetele = req.body;
    const result = await notifyModel.deleteNotify(NotifyToDetele);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const findOneById = async (req, res) => {
  try {
    const toFind = req.query;
    const result = await notifyModel.findOneById(toFind.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: error.message });
  }
}

const notifyController = {
  createNew,
  getNotifies,
  editNotify,
  deleteNotify,
  findOneById
};

module.exports = notifyController;
