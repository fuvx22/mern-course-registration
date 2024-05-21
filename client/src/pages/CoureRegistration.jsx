import { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import {
  fetchCourseSchedulesBySemesterAPI,
  fetchMajorsAPI,
  createNewCourseRegisAPI,
  getCourseRegisByUserIdAPI,
  deleteCourseRegisAPI,
  fetchSemesterByIdAPI,
  getMetatdataAPI,
} from "../apis";
import { toast } from "react-toastify";

function CourseRegistration() {
  const metadata = useRef();
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();
  const [courseSchedules, setCourseSchedules] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [findCourse, setFindCourse] = useState("");
  const [filtedcourseSchedules, setFiltedcourseSchedules] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let historyCourseRegis = useRef([]);
  let currentSemester = useRef({});
  const token = JSON.parse(localStorage.getItem("user-token"));
  const [currentSemesterId, setCurrentSemesterId] = useState(
    metadata.current?.currentSemesterId
  );
  const [isEnable, setIsEnable] = useState(
    metadata.current?.isEnableCourseRegistration
  );

  useEffect(() => {
    if (!token) {
      navigate("/");
    }

  const fetchMetadata = getMetatdataAPI(token);
  const fetchCourseSchedules = fetchCourseSchedulesBySemesterAPI(token, currentSemesterId);
  const fetchMajors = fetchMajorsAPI(token);
  const fetchSemester = currentSemesterId ? fetchSemesterByIdAPI(currentSemesterId) : Promise.resolve(null);
  const fetchCourseRegis = getCourseRegisByUserIdAPI(userData?._id, token);

  Promise.all([fetchMetadata, fetchCourseSchedules, fetchMajors, fetchSemester, fetchCourseRegis])
    .then(([metadataData, courseSchedulesData, majorsData, semesterData, courseRegisData]) => {
      metadata.current = metadataData;
      setIsEnable(metadataData.isEnableCourseRegistration);
      setCurrentSemesterId(metadataData.currentSemesterId);

      setCourseSchedules(courseSchedulesData);
      setMajors(majorsData);

      if (semesterData) {
        currentSemester.current = semesterData;
      }

      const currentSemesterCourseRegis = courseRegisData.filter((cs) => {
        return cs.semesterId === currentSemesterId;
      });
      historyCourseRegis.current = courseRegisData.filter((cs) => {
        return cs.semesterId !== currentSemesterId;
      });
      setSelectedCourses((prevCourses) => [
        ...prevCourses,
        ...currentSemesterCourseRegis,
      ]);

    })
    .then(() => {
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  }, [currentSemesterId, userData]);

  const fetchData = async () => {
    getCourseRegisByUserIdAPI(userData?._id, token).then((data) => {
      const currentSemesterCourseRegis = data.filter((cs) => {
        return cs.semesterId === currentSemesterId;
      });
      setSelectedCourses(currentSemesterCourseRegis);
    });
  };

  useEffect(() => {
    if (selectedMajor == "" && findCourse == "") {
      setFiltedcourseSchedules([]);
    } else {
      handleFilterCourseSechedules();
    }
  }, [selectedMajor, findCourse]);

  useEffect(() => {
    calculateTotalCredits();
  }, [selectedCourses]);

  const handleFilterCourseSechedules = () => {
    let filt = courseSchedules.filter((cs) => {
      return (
        (cs.course.name.toLowerCase().includes(findCourse.toLowerCase()) ||
          cs.course.courseId
            .toLowerCase()
            .includes(findCourse.toLowerCase())) &&
        (selectedMajor ? cs.course.majorId === selectedMajor : true)
      );
    });
    // sort by course name
    filt.sort((a, b) => {
      if (a.course.name < b.course.name) {
        return -1;
      }
      if (a.course.name > b.course.name) {
        return 1;
      }
      return 0;
    });
    setFiltedcourseSchedules(filt);
  };

  const calculateTotalCredits = () => {
    let total = 0;
    selectedCourses.forEach((cs) => {
      total += cs.course.courseCredits;
    });
    setTotalCredits(total);
  };

  const handleDeleteCourseRegis = async (cs) => {
    await deleteCourseRegisAPI(
      { _id: cs.courseRegisId, courseScheduleId: cs._id },
      token
    );
    fetchData();
    filtedcourseSchedules.find((c) => {
      if (c._id === cs._id) {
        c.maxQuantity += 1;
        setSelectedCourses([...selectedCourses, c]);
        return;
      }
    });
    toast.info("Xóa học phần thành công");
  };

  const handleSelectCourseSchedule = async (e) => {
    const selectedCS = courseSchedules.find((cs) => cs._id === e.target.value);

    if (e.target.checked) {
      // Calculate what the total credits would be if we add this course
      const newTotalCredits = totalCredits + selectedCS.course.courseCredits;

      // Ràng buộc ngành học
      if (selectedCS.course.majorId !== userData.majorId) {
        toast.error("Môn học không thuộc ngành học", {
          position: "top-center",
        });
        e.target.checked = false;
        return;
      }

      if (
        selectedCourses.some((cs) => cs.course._id === selectedCS.course._id) ||
        historyCourseRegis.current.some(
          (cs) => cs.course._id === selectedCS.course._id
        )
      ) {
        toast.error("Môn học đã được chọn/ học", {
          position: "top-center",
        });
        e.target.checked = false;
        return;
      }

      if (selectedCS.maxQuantity === 0) {
        toast.error("Số lượng đăng kí đã hết", {
          position: "top-center",
        });
        e.target.checked = false;
        return;
      }

      // Ràng buộc môn tiên quyết
      if (selectedCS.course.preRequireCourse != "no") {
        let check = false;
        historyCourseRegis.current.forEach((cs) => {
          if (cs.course.courseId === selectedCS.course.preRequireCourse) {
            check = true;
            return;
          }
        });
        if (!check) {
          toast.error(
            "Vui lòng học môn tiên quyết: " +
              selectedCS.course.preRequireCourse,
            {
              position: "top-center",
            }
          );
          e.target.checked = false;
          return;
        }
      }

      // Ràng buộc trùng lịch học
      let check = false;
      selectedCourses.forEach((cs) => {
        if (
          cs.period.some((p) => selectedCS.period.includes(p)) &&
          cs.dayOfWeek === selectedCS.dayOfWeek
        ) {
          toast.error("Trùng lịch học với môn: " + cs.course.name, {
            position: "top-center",
          });
          e.target.checked = false;
          check = true;
          return;
        }
      });
      if (check) return;

      // Only add the course if the new total credits would not exceed 26
      if (newTotalCredits > 26) {
        toast.error("Số tín chỉ vượt quá giới hạn", {
          position: "top-center",
        });
        e.target.checked = false;
        return;
      }

      try {
        await createNewCourseRegisAPI(
          {
            courseScheduleId: selectedCS._id,
            userId: userData._id,
          },
          token
        );
        toast.success("Đăng ký học phần thành công", { position: "top-left" });

        filtedcourseSchedules.find((cs) => {
          if (cs._id === selectedCS._id) {
            cs.maxQuantity -= 1;
            setSelectedCourses([...selectedCourses, cs]);
            return;
          }
        });

        fetchData();
      } catch (error) {
        toast.error(error.response.data.message, { position: "top-center" });
      }
    } else {
      selectedCourses.find((cs) => {
        if (cs._id === selectedCS._id) {
          handleDeleteCourseRegis(cs);
          return;
        }
      });
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <div className="my-3" style={{ minHeight: "80vh" }}>
        <h4 className="title">
          <i className="fa-solid fa-book me-2"></i>
          Đăng ký môn học{" "}
          {currentSemester?.current?.semesterName?.toLowerCase()}
        </h4>
        <div className="filter-container d-flex gap-2 mb-3">
          <div className="d-grid flex-grow-1" style={{ maxWidth: "50%" }}>
            <label className="form-label" htmlFor="major-select">
              Lọc theo khoa:
            </label>
            <select
              name=""
              id="major-select"
              className="form-select"
              onChange={(e) => {
                setSelectedMajor(e.target.value);
              }}
            >
              <option value="">Lọc học phần theo ngành</option>
              {majors.map((major) => (
                <option value={major?._id} key={major?._id}>
                  {major?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="d-grid flex-grow-1">
            <label className="form-label" htmlFor="find-inp">
              Tìm kiếm học phần:
            </label>
            <input
              type="text"
              id="find-inp"
              className="form-control"
              value={findCourse}
              onChange={(e) => setFindCourse(e.target.value)}
            />
          </div>
        </div>
        <div className="course-registraions mb-3">
          {!isEnable && (
            <h5 className="text-danger text-center">
              <i className="fa-solid fa-circle-exclamation px-1"></i>
              Ngoài thời gian đăng kí môn
            </h5>
          )}
          <h5>Danh sách môn mở đăng kí</h5>
          <div
            className="course-to-regis-container"
            style={{
              maxHeight: "50vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <table className="table table-sm">
              <thead
                className="align-middle theader"
                style={{ position: "sticky", top: "-1px", zIndex: "1" }}
              >
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Mã môn học</th>
                  <th scope="col">Tên môn học</th>
                  <th scope="col">Nhóm</th>
                  <th scope="col">Còn lại</th>
                  <th scope="col">Số tín chỉ</th>
                  <th scope="col">Thời khóa biểu</th>
                </tr>
              </thead>
              <tbody className="table-bordered">
                {filtedcourseSchedules.map((cs, idx) => (
                  <tr key={idx}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        value={cs?._id}
                        onChange={(e) => handleSelectCourseSchedule(e)}
                        style={{ cursor: "pointer" }}
                        checked={selectedCourses.some(
                          (sc) => sc._id === cs._id
                        )}
                        disabled={!isEnable}
                        className="course-regis-control"
                      />
                    </td>
                    <td>{cs?.course?.courseId}</td>
                    <td>{cs?.course?.name}</td>
                    <td>{cs?.group}</td>
                    <td>{cs?.maxQuantity}</td>
                    <td>{cs?.course?.courseCredits}</td>
                    <td>
                      {`${cs?.dayOfWeek}, tiết ${cs?.period[0]} đến ${
                        cs?.period[cs?.period.length - 1]
                      }, phòng ${cs?.roomNumber}, giảng viên ${
                        cs?.instructor?.name
                      }`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="resgisted-courses-container">
          <h5>
            Danh sách môn đã đăng kí:
            <span className="text-danger ms-2">
              {selectedCourses.length} môn, {totalCredits} tín chỉ
            </span>
          </h5>
          <table className="table table-sm">
            <thead className="align-middle theader">
              <tr>
                <th scope="col">Xóa</th>
                <th scope="col">Mã môn học</th>
                <th scope="col">Tên môn học</th>
                <th scope="col">Nhóm</th>
                <th scope="col">Còn lại</th>
                <th scope="col">Số tín chỉ</th>
                <th scope="col">Thời khóa biểu</th>
              </tr>
            </thead>
            <tbody className="table-bordered">
              {selectedCourses &&
                (selectedCourses.map((cs, idx) => (
                  <tr key={idx}>
                    <td className="text-center">
                      <button
                        href=""
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCourseRegis(cs)}
                        disabled={!isEnable}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                    <td>{cs?.course?.courseId}</td>
                    <td>{cs?.course?.name}</td>
                    <td>{cs?.group}</td>
                    <td>{cs?.maxQuantity}</td>
                    <td>{cs?.course?.courseCredits}</td>
                    <td>
                      {`${cs?.dayOfWeek}, tiết ${cs?.period[0]} đến ${
                        cs?.period[cs?.period.length - 1]
                      }, phòng ${cs?.roomNumber}, giảng viên ${
                        cs?.instructor?.name
                      }`}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CourseRegistration;
