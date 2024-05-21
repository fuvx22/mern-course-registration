import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
// import { useUser } from "../context/userContext";
import { UserContext } from "../context/userContext";
import { Link, useNavigate } from "react-router-dom";
import { fetchNotifiesAPI } from "../apis";
import { convert } from "html-to-text";
import { toast } from "react-toastify";

function Dashboard() {
  // const { fetchUserData, userData } = useUser();
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();
  const [notifies, setNotifies] = useState([]);
  const token = JSON.parse(localStorage.getItem("user-token"));
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const notifies = await fetchNotifiesAPI(token);
        setNotifies(notifies);
      } catch (error) {
        toast.error("Không thể kết nối đến server");
      }
    };

    fetchData();
  }, []);

  // Sử dụng vòng lặp for để tạo mảng divs chứa các thẻ div
  const divs = [];
  for (let i = 0; i < notifies.length; i++) {
    divs.push(
      <div
        className="announce-item rounded-2"
        key={i}
        onClick={() => navigate("/notify/" + notifies[i]?._id)}
      >
        <h4 className="announce-item-title">{notifies[i]?.title}</h4>
        <p className="anounce-content truncate">
          {convert(notifies[i]?.content)}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="col-12 col-sm-10 col-md-8 m-auto">
        <Navbar user={userData} />
        {notifies.length > 0 ? (
          <div className="dashboard d-flex flex-column gap-3 ">
            <div className="announcement-section h-sx-100  mt-2 h-sx-auto">
              <h2>Thông báo</h2>
              <div className="announce-container d-sm-flex gap-3 flex-wrap align-item-center justify-content-start border-start border-2 ps-2 my-3">
                {divs}
              </div>
            </div>
            <div className="guild-section">
              <h2>Hướng dẫn</h2>
              <div className="guild-container border-start border-2 ps-2 my-3">
                <table className="table table-hover">
                  <tbody>
                    <tr>
                      <td>Hướng dẫn đăng kí học phần trực tuyến</td>
                    </tr>
                    <tr>
                      <td>Những điểm lưu ý khi đăng kí học phần</td>
                    </tr>
                    <tr>
                      <td>Hướng dẫn nộp biên bản</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ height: "100vh" }}
            className="d-flex justify-content-center align-items-center"
          >
            <div
              className="spinner-border text-primary"
              style={{ width: "4.5rem", height: "4.5rem" }}
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
