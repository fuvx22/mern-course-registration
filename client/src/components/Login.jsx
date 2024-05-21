import React, { useEffect, useState, useContext } from "react";
import { loginAPI } from "../apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import * as logo from "../assets/SGU-LOGO.png";

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  // const { fetchUserData, userData } = useUser();
  const token = JSON.parse(localStorage.getItem("user-token"));
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isShowPass, setIsShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(null);
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (!id || !password) return;
      let res = await loginAPI(id, password);
      if (res.status == 200) {
        setIsLoading(false);
        localStorage.setItem("user-token", JSON.stringify(res.data));
        login(res.data);
        toast.success("Đăng nhập thành công");
        navigate("/dashBoard");
      }
    } catch (error) {
      setIsLoading(false);
      if (!error.response) {
        toast.error("Khong ket noi duoc voi server");
        return;
      }
      toast.error(error.response.data.error);
    }
  };
  useEffect(() => {
    if (!token) {
      return;
    } else {
      navigate("/dashBoard");
    }
  }, []);
  return (
    <form action="">
      <div
        className="login-container col-xs-10 col-sm-6 col-lg-4"
        style={{ minHeight: "80vh" }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={logo.default}
            alt=""
            style={{ objectFit: "cover", height: "200px" }}
          />
        </div>
        <div className="title">Đăng Nhập</div>
        <div className="text">Student ID</div>
        <input
          value={id}
          onChange={(event) => setId(event.target.value)}
          type="text"
          placeholder="Student ID..."
        />
        <div className="text">Password</div>
        <div className="password-input">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={isShowPass ? "text" : "password"}
            placeholder="Password..."
          />
          <i
            className={isShowPass ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}
            onClick={() => setIsShowPass(!isShowPass)}
          ></i>
        </div>

        <button
          disabled={!id || !password || isLoading}
          className={id && password && !isLoading ? "active" : ""}
          onClick={() => handleLogin()}
        >
          <div className="d-flex justify-content-center align-items-center gap-3 position-relative">
            <span className="fs-5">Login</span>
            {isLoading && (
              <div
                className="spinner-border text-primary position-absolute end-0"
                role="status"
              >
                <span className="visually-hidden"></span>
              </div>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}

export default Login;
