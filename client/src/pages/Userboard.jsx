import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { getImageUser, fetchUserAPI, fetchMajorsAPI } from "../apis";
function Userboard() {
  const { userData } = useContext(UserContext);
  const [userImage, setUserImage] = useState(null);
  const [majors, setMajors] = useState([]);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user-token"));
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchImageData = async () => {
      try {
        const responseUser = await fetchUserAPI(token);
        const responseImage = await getImageUser(
          token,
          responseUser.data.image
        );
        const imageURL = URL.createObjectURL(responseImage.data);
        const majorData = await fetchMajorsAPI(token);
        setMajors(majorData);
        setUserImage(imageURL);
        // Now you can use the imageUrl to display the image in your component
      } catch (error) {
        toast.error("Không thể tìm thấy ảnh");
        throw new Error("Cant connect to the server!");
      }
    };
    fetchImageData();
  }, []);
  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      {userData ? (
        <div className="userboard-container d-sm-flex flex-sm-row d-flex flex-column align-items-center align-items-sm-stretch gap-2 mt-2">
          <div
            className="user-info d-flex flex-column align-items-center justify-content-center px-5 border rounded bg-light"
            style={{ width: "300px" }}
          >
            <img
              src={userImage}
              alt=""
              className="rounded-circle img-thumbnail"
              style={{ width: "200px", height: "200px" }}
            />
            <h5 className="d-inline">{userData?.name}</h5>
            <p className="d-inline">
              {userData?.role === "major" ? null : userData?.academicYear}
            </p>
          </div>
          <div className="flex-grow-1 d-flex flex-column gap-2">
            <div className="user-detail-info pt-3 px-5 border rounded bg-light">
              <p>
                {userData?.role === "major" ? "Mã Khoa" : "MSSV"}:{" "}
                {userData?.userId}
              </p>
              <p>
                {userData?.role === "major" ? "Tên khoa" : "Họ và tên"}:{" "}
                {userData?.name}
              </p>
              <p>Số điện thoại: {userData?.phoneNumber}</p>
              <p>Tôn giáo: {userData?.religion}</p>
              <p>Dân tộc: {userData?.ethnic}</p>
              <p>Địa chỉ: {userData?.address}</p>
              {userData?.role === "major" ? null : (
                <div>
                  <p>
                    Ngành: {majors.find((m) => m._id == userData.majorId)?.name}
                  </p>
                  <p>Chuyên ngành: {userData?.specializedMajor}</p>
                  <p>Niên khóa: {userData?.academicYear}</p>
                  <p>Cố vấn học tập: {userData?.AcademicAdvisor}</p>
                </div>
              )}
            </div>
            {userData?.role === "major" ? null : (
              <div className="user-study-progress p-2 px-5 border rounded bg-light">
                <p>Tiến độ học tập</p>
                <div
                  className="progress"
                  role="progressbar"
                  aria-label="Example with label"
                  aria-valuenow="80"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-bar bg-success"
                    style={{ width: "80%" }}
                  >
                    85%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{ height: "100vh" }}
          className="d-flex justify-content-center align-items-center"
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "6rem", height: "6rem" }}
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userboard;
