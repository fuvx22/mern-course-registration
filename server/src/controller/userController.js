const bcryptjs = require("bcryptjs");
const env = require("../config/environment");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const fs = require("fs");
const md5 = require("md5");
const hashSecretKey = md5(env.SECRET_KEY);
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const {
  findUserByObjectId,
  createNew,
  findUserById,
  findUserByRole,
  deleteUserById,
  editUserById,
  editPassword,
} = require("../model/userModel");
module.exports = {
  createNewUser: async (req, res) => {
    try {
      const { password, userId, ...userData } = req.body;
      const fileName = req.file.filename;
      const validUser = await findUserById(userId);
      if (validUser) {
        res.status(400).json({ error: "Mã số sinh viên/khoa đã tồn tại" });
        return;
      }
      const hashPassword = await bcryptjs.hash(password, saltRounds);
      const newUser = {
        ...userData,
        userId: userId,
        password: hashPassword,
        image: fileName,
      };
      // console.log(userData);
      const registerUser = await createNew(newUser);
      res.status(200).json(registerUser);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { userId, password } = req.body;
      const user = await findUserById(userId);

      if (!user) {
        res.status(401).json({ error: "Mã Số Sinh viên không tồn tại" });
        return;
      }
      const isPasswordMatch = await bcryptjs.compare(password, user.password);
      if (!isPasswordMatch) {
        res.status(401).json({ error: "Sai Mật Khẩu" });
      } else {
        const userJTW = {
          userId: user.userId,
          name: user.name,
          email: user.phone,
        };

        const accessToken = await jwt.sign(userJTW, hashSecretKey);
        res.status(200).send({ accessToken: accessToken });
      }
    } catch {}
  },
  getUserById: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const user = await findUserById(userId);
      if (user) {
        res.status(200).json(user);
      }
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },
  getImageUser: async (req, res, next) => {
    try {
      const imageName = req.params.img;
      const imagePath = path.join(__dirname, "../../public/image", imageName);
      if (!fs.existsSync(imagePath)) {
        return res
          .status(StatusCodes.BAD_GATEWAY)
          .json({ error: "Image not found" });
      }
      const imageStream = fs.createReadStream(imagePath);
      res.setHeader("Content-Type", "image/jpeg");
      imageStream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getAllUser: async (req, res, next) => {
    try {
      const { role } = req.params;
      const users = await findUserByRole(role);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deleteUserSelected: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const userData = await findUserByObjectId(userId);
      const imageName = userData.image;
      const imagePath = path.join(__dirname, "../../public/image", imageName);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Không thể xóa hình ảnh: ${err.message}`);
        } else {
          console.log("xóa thành công");
        }
      });
      const result = await deleteUserById(userId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },
  updateUserById: async (req, res, next) => {
    try {
      const userSelected = req.body;
      const { _id, password, image, majorData, ...data } = userSelected;
      console.log(data.specializedMajor);
      let imageName = null;
      const file = req.file;
      if (file) {
        imageName = file.filename;
      } else {
        imageName = image;
      }
      const isPasswordMatch = await bcryptjs.compare(
        password,
        userSelected.password
      );
      if (!isPasswordMatch) {
        const hashPassword = await bcryptjs.hash(password, saltRounds);
        userSelected.password = hashPassword;
      }
      const updatedUser = {
        ...data,
        image: imageName,
        password: userSelected.password,
      };
      const result = await editUserById(_id, updatedUser);
      if (result) {
        res.status(StatusCodes.OK).json(result);
      } else {
        res.status(400).json({ message: "Failed to update user" });
      }
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { oldPassword, newPassword } = req.body;
      const user = await findUserById(id);
      const isPasswordMatch = await bcryptjs.compare(
        oldPassword,
        user.password
      );
      if (!isPasswordMatch) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Old password is incorrect" });
        return;
      }
      const hashPassword = await bcryptjs.hash(newPassword, saltRounds);
      const result = await editPassword(id, hashPassword);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },
};
