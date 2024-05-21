import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import {
  fetchCourseSchedulesAPI,
  createNewCourseScheduleAPI,
  editCourseScheduleAPI,
  deleteCourseScheduleAPI,
  fetchSemestersAPI,
  fetchCoursesAPI,
  getInstructor,
  fetchUserAPI,
} from "../apis";
import { semesterErrorClassify } from "../utils/validator";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

const customStyles = {
  content: {
    width: "max-content",
    height: "600px",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

let indexToEdit = -1;

function CourseScheduleManage() {
  const [courseSchedules, setCourseSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [semesters, setSemesters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourseSchedule, setSelectedCourseSchedule] = useState(null);
  const { userData } = useContext(UserContext);
  const token = JSON.parse(localStorage.getItem("user-token"));

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const respone = await fetchUserAPI(token);
        if (respone.data.role == "admin") {
          const data = await fetchCourseSchedulesAPI(token);
          const courseData = await fetchCoursesAPI(token);
          const instructorData = await getInstructor(token);
          const semesterData = await fetchSemestersAPI(token);

          setCourseSchedules(data);
          setCourses(courseData);
          setInstructors(instructorData);
          setSemesters(semesterData);
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

  const navigate = useNavigate();
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [period, setPeriod] = useState("");
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");
  const [group, setGroup] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [course, setCourse] = useState("");
  const [instructor, setInstructor] = useState("");
  const [semester, setSemester] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const courseScheduleIdRef = useRef(null);

  const handleAddCourseSchedule = async () => {
    if (
      dayOfWeek &&
      startPeriod != "default" &&
      startPeriod != "" &&
      endPeriod != "default" &&
      endPeriod != "" &&
      group &&
      roomNumber &&
      maxQuantity &&
      courses != "default" &&
      courses != "" &&
      instructors != "default" &&
      instructors != "" &&
      semesters != "default" &&
      semesters != ""
    ) {
      try {
        //const periodArray = period.toString().split('').map(Number);
        const periodArray = [];
        for (let i = parseInt(startPeriod); i <= parseInt(endPeriod); i++) {
          periodArray.push(i);
        }
        const newCourseSchedule = {
          dayOfWeek: dayOfWeek,
          startPeriod: startPeriod,
          endPeriod: endPeriod,
          period: periodArray,
          group: group,
          roomNumber: roomNumber,
          maxQuantity: maxQuantity,
          courseId: course,
          instructorId: instructor,
          semesterId: semester,
        };

        const createdCourseSchedule = await createNewCourseScheduleAPI(
          newCourseSchedule,
          token
        );
        setCourseSchedules([...courseSchedules, createdCourseSchedule]);
        cancelActivity();
        toast.success("Thêm thành công");
      } catch (error) {
        if (error.response.data.error.includes("Trùng tiết học")) {
          const errorMessage = error.response.data.error;
          const courseIdRegex = /:\s*([a-f0-9]{24})/;
          const match = errorMessage.match(courseIdRegex);
          if (match && match[1]) {
            const courseId = match[1];
            const courseName = courses.find((c) => c._id == courseId)?.name;
            return toast.error(
              `Trùng tiết học/phòng học với môn ${courseName}`,
              {
                position: "top-center",
                theme: "colored",
              }
            );
          }
        }
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
      courseScheduleIdRef.current.focus();
    }
  };

  const handleEditCourseSchedule = (index) => {
    setIsEdit(true);
    indexToEdit = index;
    setDayOfWeek(courseSchedules[index].dayOfWeek);
    //setPeriod(courseSchedules[index].period.join(''));
    setStartPeriod(courseSchedules[index].period[0].toString());
    setEndPeriod(
      courseSchedules[index].period[
        courseSchedules[index].period.length - 1
      ].toString()
    );
    setGroup(courseSchedules[index].group);
    setRoomNumber(courseSchedules[index].roomNumber);
    setMaxQuantity(courseSchedules[index].maxQuantity);
    setCourse(courseSchedules[index].courseId);
    setInstructor(courseSchedules[index].instructorId);
    setSemester(courseSchedules[index].semesterId);
  };

  const confirmEdit = async () => {
    //const periodArray = period.toString().split('').map(Number);
    // console.log(selectedCourseSchedule);
    const periodArray = [];
    for (
      let i = parseInt(selectedCourseSchedule.startPeriod);
      i <= parseInt(selectedCourseSchedule.endPeriod);
      i++
    ) {
      periodArray.push(i);
    }
    // console.log(periodArray);

    const {
      courseId,
      instructorId,
      semesterId,
      dayOfWeek,
      startPeriod,
      endPeriod,
      group,
      roomNumber,
      maxQuantity,
    } = selectedCourseSchedule;

    if (
      courseId != "" ||
      instructorId != "" ||
      semesterId != "" ||
      dayOfWeek != "" ||
      startPeriod != "" ||
      endPeriod != "" ||
      group != "" ||
      roomNumber != "" ||
      maxQuantity != ""
    ) {
      try {
        selectedCourseSchedule.period = periodArray;
        console.log(selectedCourseSchedule.period);
        await editCourseScheduleAPI(selectedCourseSchedule);
        const updatedCourseSchedule = await fetchCourseSchedulesAPI(token);
        setCourseSchedules(updatedCourseSchedule);
        toast.success("Cập nhật thành công");
        closeModal();
      } catch (error) {
        if (error.response.data.error.includes("Trùng tiết học")) {
          const errorMessage = error.response.data.error;
          const courseIdRegex = /:\s*([a-f0-9]{24})/;
          const match = errorMessage.match(courseIdRegex);
          if (match && match[1]) {
            const courseId = match[1];
            const courseName = courses.find((c) => c._id == courseId)?.name;
            return toast.error(
              `Trùng tiết học/phòng học với môn ${courseName}`,
              {
                position: "top-center",
                theme: "colored",
              }
            );
          }
        }
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
      courseScheduleIdRef.current.focus();
    }
  };

  const handleEditModal = async (courseSchedule) => {
    setSelectedCourseSchedule(courseSchedule);

    setIsOpen(true);
  };

  const handleDeleteCourseSchedule = async (index) => {
    try {
      const courseSchedulesToEdit = [...courseSchedules];
      await deleteCourseScheduleAPI(courseSchedulesToEdit[index]);
      courseSchedulesToEdit.splice(index, 1);
      setCourseSchedules(courseSchedulesToEdit);
      toast.success("Xóa thành công", {
        position: "top-left",
      });
    } catch (error) {
      throw new Error(error);
    }
  };

  const cancelActivity = () => {
    setDayOfWeek("");
    setStartPeriod("");
    setEndPeriod("");
    setGroup("");
    setRoomNumber("");
    setMaxQuantity("");
    setCourse("");
    setInstructor("");
    setSemester("");
    setIsEdit(false);
    indexToEdit = -1;
  };

  const generatePeriod = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <h3>Quản lý đăng ký môn học</h3>
      <div className="control-container my-3 d-flex flex-wrap gap-2">
        <div className="control-item">
          <label htmlFor="course" className="form-label">
            Môn học
          </label>
          <select
            value={course}
            className="form-select"
            id="course"
            defaultValue={"default"}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="default">Chọn môn học</option>
            {courses.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-item">
          <label htmlFor="instructor" className="form-label">
            Giảng viên
          </label>
          <select
            value={instructor}
            className="form-select"
            id="instructor"
            defaultValue={"default"}
            onChange={(e) => setInstructor(e.target.value)}
          >
            <option value="default">Chọn giảng viên</option>
            {instructors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-item">
          <label htmlFor="semester" className="form-label">
            Học kỳ
          </label>
          <select
            value={semester}
            className="form-select"
            id="semester"
            defaultValue={"default"}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="default">Chọn học kỳ</option>
            {semesters.map((m) => (
              <option key={m._id} value={m._id}>
                {m.semesterName}
              </option>
            ))}
          </select>
        </div>
        <div className="control-item">
          <label htmlFor="dayOfWeek" className="form-label">
            Ngày học
          </label>
          <select
            value={dayOfWeek}
            className="form-select"
            id="dayOfWeek"
            defaultValue={"default"}
            onChange={(e) => setDayOfWeek(e.target.value)}
          >
            <option value="default">Chọn ngày học</option>
            <option value="Thứ 2">Thứ 2</option>
            <option value="Thứ 3">Thứ 3</option>
            <option value="Thứ 4">Thứ 4</option>
            <option value="Thứ 5">Thứ 5</option>
            <option value="Thứ 6">Thứ 6</option>
            <option value="Thứ 7">Thứ 7</option>
          </select>
        </div>
        <div className="control-item">
          <div className="d-flex justify-content-between">
            <div style={{ flex: "0 0 45%" }}>
              <label htmlFor="" className="form-label">
                Tiết bắt đầu
              </label>
              <select
                value={startPeriod}
                className="form-select"
                id="startPeriod"
                defaultValue={"default"}
                onChange={(e) => setStartPeriod(e.target.value)}
              >
                <option value="default">Chọn tiết bắt đầu</option>
                {generatePeriod()}
              </select>
            </div>
            <div style={{ flex: "0 0 45%" }}>
              <label htmlFor="" className="form-label">
                Tiết kết thúc
              </label>
              <select
                value={endPeriod}
                className="form-select"
                id="endPeriod"
                defaultValue={"default"}
                onChange={(e) => setEndPeriod(e.target.value)}
              >
                <option value="default">Chọn tiết kết thúc</option>
                {generatePeriod()}
              </select>
            </div>
          </div>
        </div>

        <div className="control-item">
          <label htmlFor="group" className="form-label">
            Nhóm lớp
          </label>
          <input
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
            }}
            type="text"
            className="form-control"
            id="group"
          />
        </div>
        <div className="control-item">
          <label htmlFor="roomNumber" className="form-label">
            Phòng học
          </label>
          <input
            value={roomNumber}
            onChange={(e) => {
              setRoomNumber(e.target.value);
            }}
            type="text"
            className="form-control"
            id="roomNumber"
          />
        </div>
        <div className="control-item">
          <label htmlFor="maxQuantity" className="form-label">
            Sĩ số
          </label>
          <input
            value={maxQuantity}
            onChange={(e) => {
              setMaxQuantity(e.target.value);
            }}
            type="number"
            className="form-control"
            id="maxQuantity"
          />
        </div>

        <div className="control-item d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => handleAddCourseSchedule()}
          >
            Thêm mới
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
              <th scope="col">Môn học</th>
              <th scope="col">Giảng viên</th>
              <th scope="col">Học kỳ</th>
              <th scope="col">Ngày học</th>
              <th scope="col">Tiết học</th>
              <th scope="col">Nhóm lớp</th>
              <th scope="col">Phòng học</th>
              <th scope="col">Sĩ số</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {courseSchedules.map((c, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{courses.find((m) => m._id == c.courseId)?.name}</td>
                <td>
                  {instructors.find((m) => m._id == c.instructorId)?.name}
                </td>
                <td>
                  {semesters.find((m) => m._id == c.semesterId)?.semesterName}
                </td>
                <td>{c.dayOfWeek}</td>
                <td>{c.period}</td>
                <td>{c.group}</td>
                <td>{c.roomNumber}</td>
                <td>{c.maxQuantity}</td>

                <td style={{ minWidth: "110px", textAlign: "right" }}>
                  <button
                    onClick={() => {
                      handleEditModal(c);
                    }}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteCourseSchedule(index)}
                    className="btn btn-danger mx-1"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <div className="modal-header">
            <h4 className="modal-title">Chỉnh sửa </h4>
          </div>

          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="courseId" className="form-label">
                  Môn học
                </label>
                <select
                  className="form-select"
                  id="type"
                  value={selectedCourseSchedule?.courseId || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      courseId: e.target.value,
                    })
                  }
                >
                  <option value="">Chọn nhóm ngành</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="instructorId" className="form-label">
                  Giảng viên
                </label>
                <select
                  className="form-select"
                  id="type"
                  value={selectedCourseSchedule?.instructorId || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      instructorId: e.target.value,
                    })
                  }
                >
                  <option value="">Chọn giảng viên</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="courseId" className="form-label">
                  Học kỳ
                </label>
                <select
                  className="form-select"
                  id="type"
                  value={selectedCourseSchedule?.semesterId || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      semesterId: e.target.value,
                    })
                  }
                >
                  <option value="">Chọn học kỳ</option>
                  {semesters.map((semester) => (
                    <option key={semester._id} value={semester._id}>
                      {semester.semesterName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="dayOfWeek" className="form-label">
                  Ngày học
                </label>
                <select
                  className="form-select"
                  id="type"
                  value={selectedCourseSchedule?.dayOfWeek || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      dayOfWeek: e.target.value,
                    })
                  }
                >
                  <option value="default">Chọn ngày học</option>
                  <option value="Thứ 2">Thứ 2</option>
                  <option value="Thứ 3">Thứ 3</option>
                  <option value="Thứ 4">Thứ 4</option>
                  <option value="Thứ 5">Thứ 5</option>
                  <option value="Thứ 6">Thứ 6</option>
                  <option value="Thứ 7">Thứ 7</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <div style={{ flex: "0 0 45%" }}>
                    <label htmlFor="" className="form-label">
                      Tiết bắt đầu
                    </label>
                    <select
                      className="form-select"
                      id="startPeriod"
                      value={selectedCourseSchedule?.startPeriod || ""}
                      onChange={(e) =>
                        setSelectedCourseSchedule({
                          ...selectedCourseSchedule,
                          startPeriod: e.target.value,
                        })
                      }
                    >
                      period[courseSchedules[index].period.length - 1]
                      <option value="default">Chọn tiết bắt đầu</option>
                      {generatePeriod()}
                    </select>
                  </div>
                  <div style={{ flex: "0 0 45%" }}>
                    <label htmlFor="" className="form-label">
                      Tiết kết thúc
                    </label>
                    <select
                      className="form-select"
                      id="endPeriod"
                      value={selectedCourseSchedule?.endPeriod || ""}
                      onChange={(e) =>
                        setSelectedCourseSchedule({
                          ...selectedCourseSchedule,
                          endPeriod: e.target.value,
                        })
                      }
                    >
                      <option value="default">Chọn tiết kết thúc</option>
                      {generatePeriod()}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="group" className="form-label">
                  Nhóm lớp
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="group"
                  value={selectedCourseSchedule?.group || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      group: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label htmlFor="roomNumber" className="form-label">
                  Phòng học
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="roomNumber"
                  value={selectedCourseSchedule?.roomNumber || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      roomNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label htmlFor="maxQuantity" className="form-label">
                  Sĩ số
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="maxQuantity"
                  value={selectedCourseSchedule?.maxQuantity || ""}
                  onChange={(e) =>
                    setSelectedCourseSchedule({
                      ...selectedCourseSchedule,
                      maxQuantity: e.target.value,
                    })
                  }
                />
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={confirmEdit}
              className="btn btn-primary mx-1"
            >
              Lưu thay đổi
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default CourseScheduleManage;
