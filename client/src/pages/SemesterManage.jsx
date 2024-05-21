import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import {
  fetchUserAPI,
  fetchSemestersAPI,
  createNewSemesterAPI,
  editSemesterAPI,
  deleteSemesterAPI,
  getMetatdataAPI,
  updateMetadataAPI,
} from "../apis";
import { semesterErrorClassify } from "../utils/validator";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

let indexToEdit = -1;

function SemesterManage() {
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState(undefined);
  const [isEnable, setIsEnable] = useState(undefined);
  const { userData } = useContext(UserContext);
  const token = JSON.parse(localStorage.getItem("user-token"));
  useEffect(() => {
    const fetchData = async () => {
      try {
        const respone = await fetchUserAPI(token);
        if (respone.data.role == "admin") {
          const data = await fetchSemestersAPI(token);
          setSemesters(data);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error("Không thể kết nối đến server!");
        throw new Error("Can't connect to the server!");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    getMetatdataAPI(token).then((data) => {
      setSemesterId(data.currentSemesterId);
      setIsEnable(data.isEnableCourseRegistration);
    });
  }, []);

  const navigate = useNavigate();
  const [semesterName, setSemesterName] = useState("");
  const [startSemesterDate, setStartSemesterDate] = useState(new Date());
  const [endSemesterDate, setEndSemesterDate] = useState(new Date());

  const [isEdit, setIsEdit] = useState(false);
  const semesterIdRef = useRef(null);

  const handleAddSemester = async () => {
    if (semesterName) {
      try {
        const newSemester = {
          semesterName: semesterName,
          startSemesterDate: startSemesterDate,
          endSemesterDate: endSemesterDate,
        };

        const createdSemester = await createNewSemesterAPI(newSemester, token);
        setSemesters([...semesters, createdSemester]);
        cancelActivity();
        toast.success("Thêm học kỳ thành công");
      } catch (error) {
        console.log(error);
        toast.error(semesterErrorClassify(error), {
          position: "top-center",
          theme: "colored",
        });
      }
    } else {
      toast.error("Vui lòng không bỏ trống thông tin", {
        position: "top-center",
        theme: "colored",
      });
      semesterIdRef.current.focus();
    }
  };

  const handleEditSemester = (index) => {
    setIsEdit(true);
    indexToEdit = index;
    setSemesterName(semesters[index].semesterName);
    setStartSemesterDate(semesters[index].startmesterDate);
    setEndSemesterDate(semesters[index].endSemesterDate);
  };

  const confirmEdit = async () => {
    if (semesterName && startSemesterDate && endSemesterDate) {
      semesters[indexToEdit].semesterName = semesterName;
      semesters[indexToEdit].startSemesterDate = startSemesterDate;
      semesters[indexToEdit].endSemesterDate = endSemesterDate;

      try {
        await editSemesterAPI(semesters[indexToEdit]);
        toast.success("Cập nhật học kỳ thành công");
        cancelActivity();
      } catch (error) {
        toast.error(semesterErrorClassify(error), {
          position: "top-center",
          theme: "colored",
        });
        throw Error(error);
      }
    } else {
      toast.error("Vui lòng không bỏ trống thông tin", {
        position: "top-center",
        theme: "colored",
      });
      semesterIdRef.current.focus();
    }
  };

  useEffect(() => {
    console.log(startSemesterDate, endSemesterDate);
  }, [startSemesterDate, endSemesterDate]);

  const handleDeleteSemester = async (index) => {
    try {
      const semestersToEdit = [...semesters];
      await deleteSemesterAPI(semestersToEdit[index]);
      semestersToEdit.splice(index, 1);
      setSemesters(semestersToEdit);
      toast.success("Xóa thành công", {
        position: "top-left",
      });
    } catch (error) {
      throw new Error(error);
    }
  };

  const cancelActivity = () => {
    setSemesterName("");
    setStartSemesterDate("");
    setEndSemesterDate("");
    setIsEdit(false);
    indexToEdit = -1;
  };

  const handleChangeStartDate = (e) => {
    const selectedDate = new Date(e.target.value);
    setStartSemesterDate(selectedDate.toISOString().split("T")[0]);
  };

  const handleEnableCourseRegistration = async () => {
    if (semesterId) {
      try {
        const newMetadata = {
          currentSemesterId: semesterId,
          isEnableCourseRegistration: isEnable,
        };
        await updateMetadataAPI(newMetadata, token);
        toast.success("Áp dụng thành công");
      } catch (error) {
        toast.error("Đã xảy ra lỗi");
        console.log(error);
      }
    }
  };

  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <div className="mt-3 d-flex gap-3 align-items-center">
        <h3>Mở cho phép đăng kí:</h3>
        <div className="col-sm-4">
          <select
            className="form-select form-select-sm"
            aria-label=".form-select-sm example"
            onChange={(e) => {
              setSemesterId(e.target.value);
            }}
            value={semesterId}
          >
            {semesters.map((semester) => (
              <option key={semester._id} value={semester._id}>
                {semester.semesterName}
              </option>
            ))}
          </select>
        </div>
        <b>mở đăng kí: </b>
        <input
          className="p"
          type="checkbox"
          checked={isEnable}
          onChange={(e) => setIsEnable(e.target.checked)}
        />
        <button
          className="btn btn-primary"
          onClick={handleEnableCourseRegistration}
        >
          Áp dụng
        </button>
      </div>
      <div className="mt-3">
        <h3>Quản lý học kì</h3>
      </div>
      <div className="control-container my-3 d-flex flex-wrap gap-2">
        <div className="control-item">
          <label htmlFor="majorName" className="form-label">
            Tên học kỳ
          </label>
          <input
            value={semesterName}
            onChange={(e) => {
              setSemesterName(e.target.value);
            }}
            type="text"
            className="form-control"
            id="semesterName"
          />
        </div>
        <div className="control-item">
          <label htmlFor="startSemesterDate" className="form-label">
            Ngày bắt đầu
          </label>
          <input
            value={startSemesterDate}
            onChange={(e) => {
              setStartSemesterDate(e.target.value);
            }}
            //           value={new Date(startSemesterDate).toISOString().split('T')[0]}
            //           onChange={(e) => {
            //   setStartSemesterDate(new Date(e.target.value).toISOString().split('T')[0]);
            // }}
            type="date"
            className="form-control"
            id="startSemesterDate"
          />
        </div>
        <div className="control-item">
          <label htmlFor="endSemesterDate" className="form-label">
            Ngày kết thúc
          </label>
          <input
            value={endSemesterDate}
            onChange={(e) => {
              setEndSemesterDate(e.target.value);
            }}
            type="date"
            className="form-control"
            id="endSemesterDate"
          />
        </div>
        <div className="control-item"></div>
        <div className="control-item d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => (isEdit ? confirmEdit() : handleAddSemester())}
          >
            {!isEdit ? "Thêm học kỳ mới" : "Cập nhật học kỳ"}
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => cancelActivity()}
          >
            Hủy thao tác
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Tên học kỳ</th>
              <th scope="col">Ngày bắt đầu</th>
              <th scope="col">Ngày kết thúc</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((c, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{c.semesterName}</td>
                <td>
                  {new Date(c.startSemesterDate).toLocaleDateString("en-GB")}
                </td>
                <td>
                  {new Date(c.endSemesterDate).toLocaleDateString("en-GB")}
                </td>

                <td>
                  <button
                    onClick={() => handleEditSemester(index)}
                    type="button"
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteSemester(index)}
                    type="button"
                    className="btn btn-danger btn-sm"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SemesterManage;
