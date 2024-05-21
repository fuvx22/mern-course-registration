var express = require("express");
const { verifyToken } = require("../../middlewares/verifyAccesToken");
const notifyController = require("../../controller/notifyController");
const notifyRouter = express.Router();

notifyRouter
  .route("/")
  .post(verifyToken, notifyController.createNew)
  .get(verifyToken, notifyController.getNotifies);

notifyRouter.route("/edit")
  .put(notifyController.editNotify)

notifyRouter.route("/delete")
  .delete(notifyController.deleteNotify)

notifyRouter.route("/find")
  .get(notifyController.findOneById)

module.exports = {
  notifyRouter,
};
