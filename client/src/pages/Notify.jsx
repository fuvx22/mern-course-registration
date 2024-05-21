import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/userContext";
import { useParams, useNavigate } from "react-router-dom";
import { findOneNotifyAPI } from "../apis";
import { toast } from "react-toastify";

function Notify() {
  const { userData } = useContext(UserContext);
  const [notify, setNotify] = useState();
  const { id } = useParams();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user-token"));

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const getNotify = await findOneNotifyAPI(id);
        setNotify(getNotify);
      } catch (error) {
        toast.error("Không thể kết nối đến server");
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <div className="contaner mt-3" style={{ minHeight: "100vh" }}>
        {notify ? (
          <div>
            <div className="d-flex justify-content-between align-items-center">
              <h2>{notify?.title}</h2>
              <h6>
                Ngày tạo: {new Date(notify?.createAt).toLocaleDateString()}
              </h6>
            </div>
            <div
              className="mt-5 notify-content"
              style={{
                fontSize: "1.2rem",
                lineHeight: "1.7",
              }}
              dangerouslySetInnerHTML={{ __html: notify?.content }}
            ></div>
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
    </div>
  );
}

export default Notify;
