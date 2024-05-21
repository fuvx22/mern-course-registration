import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import {
  fetchUserAPI,
  fetchCoursesAPI,
  createNewCourseAPI,
  editCourseAPI,
  deleteCourseAPI,
  fetchMajorsAPI,
} from "../apis";
import { courseErrorClassify } from "../utils/validator";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

let indexToEdit = -1;

function CourseManage() {
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const { userData } = useContext(UserContext);
  const token = JSON.parse(localStorage.getItem("user-token"));
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetchUserAPI(token);
        if (response.data.role === "admin" || response.data.role === "major") {
          const data = await fetchCoursesAPI(token);
          const majorData = await fetchMajorsAPI(token);
          setCourses(data);
          setMajors(majorData);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error("Không thể kết nối đến server!");
        throw new Error("Cant connect to the server!");
      }
    };
    fetchData();
  }, []);

  const navigate = useNavigate();
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [courseMajor, setCourseMajor] = useState("");
  const [preRequireCourse, setPreRequireCourse] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const courseIdRef = useRef(null);
  const handleAddCourse = async () => {
    if (
      courseId &&
      courseName &&
      courseCredits &&
      courseMajor != "default" &&
      courseMajor != "" &&
      preRequireCourse != "default"
    ) {
      try {
        const newCourse = {
          courseId: courseId,
          name: courseName,
          preRequireCourse: preRequireCourse,
          courseCredits: courseCredits,
          majorId: courseMajor,
        };
        const createdCourse = await createNewCourseAPI(newCourse, token);
        setCourses([...courses, createdCourse]);
        cancelActivity();
        toast.success("Thêm môn học thành công");
      } catch (error) {
        toast.error(courseErrorClassify(error), {
          position: "top-center",
          theme: "colored",
        });
      }
    } else {
      toast.error("Vui lòng không bỏ trống thông tin", {
        position: "top-center",
        theme: "colored",
      });
      courseIdRef.current.focus();
    }
  };

  const handleEditCourse = (index) => {
    setIsEdit(true);
    indexToEdit = index;
    setCourseId(courses[index].courseId);
    setCourseName(courses[index].name);
    setCourseCredits(courses[index].courseCredits);
    setPreRequireCourse(courses[index].preRequireCourse);
    setCourseMajor(courses[index].majorId);
  };

  const confirmEdit = async () => {
    if (
      courseId &&
      courseName &&
      courseCredits &&
      courseMajor != "default" &&
      courseMajor != "" &&
      preRequireCourse != "default"
    ) {
      courses[indexToEdit].courseId = courseId;
      courses[indexToEdit].name = courseName;
      courses[indexToEdit].courseCredits = courseCredits;
      courses[indexToEdit].preRequireCourse = preRequireCourse;
      courses[indexToEdit].majorId = courseMajor;

      try {
        await editCourseAPI(courses[indexToEdit]);
        toast.success("Cập nhật môn học thành công");
        cancelActivity();
      } catch (error) {
        toast.error(courseErrorClassify(error), {
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
      courseIdRef.current.focus();
    }
  };

  const handleDeleteCourse = async (index) => {
    try {
      const coursesToEdit = [...courses];
      await deleteCourseAPI(coursesToEdit[index]);
      coursesToEdit.splice(index, 1);
      setCourses(coursesToEdit);
      toast.success("Xóa thành công", { position: "top-left" });
    } catch (error) {
      throw Error(error);
    }
  };

  const cancelActivity = () => {
    setCourseCredits("");
    setCourseId("");
    setCourseMajor("");
    setPreRequireCourse("");
    setCourseName("");
    setIsEdit(false);
    indexToEdit = -1;
  };
  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <h3>Quản lý môn học</h3>
      <div className="control-container my-3 d-flex flex-wrap gap-2">
        <div className="control-item">
          <label htmlFor="courseId" className="form-label">
            Mã môn học
          </label>
          <input
            ref={courseIdRef}
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
            }}
            type="text"
            className="form-control"
            id="courseId"
          />
        </div>
        <div className="control-item">
          <label htmlFor="courseName" className="form-label">
            Tên môn học
          </label>
          <input
            value={courseName}
            onChange={(e) => {
              setCourseName(e.target.value);
            }}
            type="text"
            className="form-control"
            id="courseName"
          />
        </div>
        <div className="control-item">
          <label htmlFor="courseCredit" className="form-label">
            Số tín chỉ
          </label>
          <input
            value={courseCredits}
            onChange={(e) => {
              setCourseCredits(e.target.value);
            }}
            type="text"
            className="form-control"
            id="courseCredit"
          />
        </div>
        <div className="control-item">
          <label htmlFor="courseMajor" className="form-label">
            Khoa
          </label>
          <select
            value={courseMajor}
            className="form-select"
            id="courseMajor"
            defaultValue={"default"}
            onChange={(e) => setCourseMajor(e.target.value)}
          >
            <option value="default">Chọn khoa</option>
            {majors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-item">
          <label htmlFor="preRequireCourse" className="form-label">
            Môn tiên quyết
          </label>
          <select
            value={preRequireCourse}
            className="form-select"
            id="preRequireCourse"
            defaultValue={"default"}
            onChange={(e) => setPreRequireCourse(e.target.value)}
          >
            <option value="default" selected>
              Chọn môn tiên quyết
            </option>
            <option value="no">Không có môn tiên quyết</option>
            {courses.map((c, i) => (
              <option key={i} value={c.courseId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-item"></div>
        <div className="control-item d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => (isEdit ? confirmEdit() : handleAddCourse())}
          >
            {!isEdit ? "Thêm môn học mới" : "Cập nhật môn học"}
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
              <th scope="col">Mã môn</th>
              <th scope="col">Tên môn học</th>
              <th scope="col">Số tín chỉ</th>
              <th scope="col">Khoa</th>
              <th scope="col">Môn tiên quyết</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{c.courseId}</td>
                <td>{c.name}</td>
                <td>{c.courseCredits}</td>
                <td>{majors.find((m) => m._id == c.majorId)?.name}</td>
                <td>
                  {courses.find(
                    (course) => course.courseId == c.preRequireCourse
                  )?.name || "Không"}
                </td>
                <td>
                  <button
                    onClick={() => handleEditCourse(index)}
                    type="button"
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteCourse(index)}
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

export default CourseManage;
