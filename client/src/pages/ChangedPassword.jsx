import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../apis";
import { toast } from "react-toastify";
const ChangedPassword = () => {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const token = JSON.parse(localStorage.getItem("user-token"));
  const [inputPassword, setInputPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(null);
  const handleInputChange = (e) => {
    setInputPassword({
      ...inputPassword,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
  }, []);
  useEffect(() => {
    if (inputPassword.newPassword !== inputPassword.confirmPassword) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
    }
  }, [inputPassword.newPassword, inputPassword.confirmPassword]);
  const handleChangePassword = async () => {
    try {
      const { oldPassword, newPassword, confirmPassword } = inputPassword;
      if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Mật khẩu không trùng khớp");
        return;
      }
      const response = await changePassword(token, userData, inputPassword);
      if (response) {
        toast.success("Đổi mật khẩu thành công");
      }
    } catch (error) {
      toast.error(error.response.data.error);
      console.log(error.message);
    }
  };
  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <h3>Đặt lại mật khẩu</h3>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Mật khẩu cũ</label>
              <input
                type="password"
                className="form-control"
                id="oldPassword"
                name="oldPassword"
                value={inputPassword.oldPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu cũ"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                name="newPassword"
                value={inputPassword.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={inputPassword.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            {!passwordMatch ? (
              <p className="text-danger">Mật khẩu không trùng khớp</p>
            ) : (
              <p className="text-success">Mật khẩu mới trùng khớp</p>
            )}
            <button
              className="btn btn-primary align-center"
              onClick={handleChangePassword}
            >
              Đặt lại mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangedPassword;
