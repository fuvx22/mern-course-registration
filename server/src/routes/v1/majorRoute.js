var express = require("express")
const  { StatusCodes } = require("http-status-codes")
const majorController = require("../../controller/majorController")
const { verifyToken } = require("../../middlewares/verifyAccesToken")
const majorRouter = express.Router()


majorRouter
    .route("/")
    .post(verifyToken, majorController.createNew)
    .get(verifyToken, majorController.getMajors)

majorRouter.route("/edit")
    .put((req, res) => majorController.editMajor(req, res))

majorRouter.route("/delete")
    .delete((req, res) => majorController.deleteMajor(req, res))

module.exports = {
    majorRouter,
};