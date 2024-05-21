import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { fetchUserAPI, getImageUser } from "../apis";
import { toast } from "react-toastify";

function Navbar(props) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { role, imageUser } = useContext(UserContext);
  const [image, setImage] = useState(null);
  const token = JSON.parse(localStorage.getItem("user-token"));
  const handleOpenSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };
  const handleLogout = () => {
    localStorage.removeItem("user-token");
    navigate("/");
  };
  const redirect = (url) => {
    if (token) {
      navigate(url);
    } else {
      navigate("/");
    }
  };
  const handleUsersManager = () => {
    if (token) {
      navigate("/user-manage");
    } else {
      navigate("/");
    }
  };
  const handleSemesterManager = () => {
    if (token) {
      navigate("/semester-manage");
    } else {
      navigate("/");
    }
  };
  const handleCourseScheduleManager = () => {
    if (token) {
      navigate("/course-schedule-manage");
    } else {
      navigate("/");
    }
  };
  const handleChangPassword = () => {
    if (token) {
      navigate("/change-password");
    } else {
      navigate("/");
    }
  };
  useEffect(() => {
    const fetchUserImage = async () => {
      const response = await fetchUserAPI(token);
      const responseImage = await getImageUser(token, response.data.image);
      const imageURL = URL.createObjectURL(responseImage.data);
      setImage(imageURL);
    };
    fetchUserImage();
  }, []);
  return (
    <div className="my-navbar px-2">
      <button
        className=" border-0 text-light py-1 px-3"
        onClick={handleOpenSideMenu}
      >
        {isSideMenuOpen ? (
          <i className="fa-solid fa-xmark"></i>
        ) : (
          <i className="fas fa-bars"></i>
        )}
      </button>
      <div className="navbar-user-info d-flex h-100 .align-items-*-center position-relative">
        <span className="navbar-user-name mx-2 ">
          {props.user && props.user.name}
        </span>
        <img
          className="navbar-user-img rounded-circle h-80"
          src={imageUser ? imageUser : image}
          alt=""
        />
        <ul className="dropdown-menu dropdown-menu-right overflow-hidden py-0 end-0 top-100">
          <li className="dropdown-item" onClick={() => redirect("/userBoard")}>
            Thông tin cá nhân
          </li>
          <div className="dropdown-divider m-0"></div>
          <li className="dropdown-item" onClick={handleChangPassword}>
            Đổi mật khẩu
          </li>
          <div className="dropdown-divider m-0"></div>
          <li className="dropdown-item" onClick={handleLogout}>
            Đăng xuất
          </li>
        </ul>
      </div>
      <div
        className={
          isSideMenuOpen
            ? "side-menu col-12 col-sm-2 active"
            : "side-menu col-12 col-sm-2"
        }
      >
        <button
          className=" border-0 text-light position-absolute end-0 px-3 py-1 d-sm-none"
          onClick={handleOpenSideMenu}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <ul className="side-menu-option-list mt-5">
          <li
            className="side-menu-option"
            onClick={() => navigate("/dashBoard")}
          >
            Trang chủ
          </li>
          {role === "admin" || role === "major" ? (
            <>
              <li className="side-menu-option" onClick={handleUsersManager}>
                Quản lí Tài Khoản
              </li>
              <li
                className="side-menu-option"
                onClick={() => redirect("/instructor-manage")}
              >
                Quản lí Giảng Viên
              </li>
              <li
                className="side-menu-option"
                onClick={() => redirect("/course-manage")}
              >
                Quản lí môn học
              </li>
              <li
                className="side-menu-option"
                onClick={handleCourseScheduleManager}
              >
                Quản lí đăng ký môn học
              </li>
              <li
                className="side-menu-option"
                onClick={() => redirect("/major-manage")}
              >
                Quản lí khoa
              </li>
              <li className="side-menu-option" onClick={handleSemesterManager}>
                Quản lí học kỳ
              </li>
              <li
                className="side-menu-option"
                onClick={() => redirect("/notify-manage")}
              >
                Quản lí thông báo
              </li>
            </>
          ) : null}

          <li
            className="side-menu-option"
            onClick={() => redirect("/userBoard")}
          >
            Thông tin cá nhân
          </li>
          <li
            className="side-menu-option"
            onClick={() => redirect("/course-registration")}
          >
            Đăng ký học phần
          </li>
          <li
            className="side-menu-option"
            onClick={() => redirect("/schedule")}
          >
            Xem thời khóa biểu
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
