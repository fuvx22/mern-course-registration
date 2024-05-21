const majorModel = require("../model/majorModel");
const { StatusCodes } = require("http-status-codes");


const createNew = async (req, res) => {
    try {
        const newMajor = req.body;
        const createdMajor = await majorModel.createNew(newMajor);
        res.status(StatusCodes.CREATED).json(createdMajor);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({error: error.message});
    }
}

const getMajors = async (req, res) => {
    try {
        const majors = await majorModel.getMajors()
        res.status(StatusCodes.OK).json(majors)
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});
    }
}

const editMajor = async (req, res) => {
    try {
        const majorToEdit = req.body;
        const editedMajor = await majorModel.editMajor(majorToEdit);
        res.status(StatusCodes.OK).json(editedMajor);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message})
    }
}

const deleteMajor = async (req, res) => {
    try {
        const majorToDelete = req.body;
        console.log(req.body)
        const result = await majorModel.deleteMajor(majorToDelete)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: error.message});
    }
}


const majorController = {
    createNew,
    getMajors,
    editMajor,
    deleteMajor
}

module.exports = majorController;