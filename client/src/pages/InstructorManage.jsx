import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  fetchUserAPI,
  getInstructor,
  addInstructor,
  fetchMajorsAPI,
  editInstructor,
  deleteInstructor,
} from "../apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const InstructorManage = () => {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const [instructors, setInstructors] = useState([]);
  const [majors, setMajors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const token = JSON.parse(localStorage.getItem("user-token"));
  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetchUserAPI(token);
        if (response.data.role === "admin" || response.data.role === "major") {
          const data = await getInstructor(token);
          const majorData = await fetchMajorsAPI(token);
          setMajors(majorData);
          setInstructors(data);
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
  const [newInstructor, setNewInstructor] = useState({
    instructorId: "",
    name: "",
    degree: "",
    email: "",
    majorId: "",
  });
  const handleInputChange = (e) => {
    setNewInstructor({
      ...newInstructor,
      [e.target.name]: e.target.value,
    });
  };
  const handleMajorChange = (e) => {
    setNewInstructor({
      ...newInstructor,
      majorId: e.target.value,
    });
  };
  const handleEditModal = async (instructor) => {
    setSelectedInstructor(instructor);
    setIsOpen(true);
  };
  const handleEditInstructor = async () => {
    const { instructorId, name, degree, email, majorId } = selectedInstructor;
    if (
      instructorId == "" ||
      name == "" ||
      degree == "" ||
      email == "" ||
      majorId == ""
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const nameAndDegreeRegex = /^[a-zA-ZÀ-ỹ-\s]{5,}$/;
    if (!nameAndDegreeRegex.test(name) || !nameAndDegreeRegex.test(degree)) {
      toast.error("Tên hoặc bằng cấp không hợp lệ");
      return;
    }
    await editInstructor(selectedInstructor, token);
    const updatedInstructors = await getInstructor(token);
    setInstructors(updatedInstructors);
    closeModal();
    toast.success("Cập nhật giảng viên thành công");
  };
  const handleAddInstructor = async () => {
    try {
      const { instructorId, name, degree, majorId, email } = newInstructor;
      if (
        instructorId == "" ||
        name == "" ||
        degree == " " ||
        majorId == "" ||
        email == ""
      ) {
        toast.error("Vui Lòng Điền đầy đủ thông tin");
      } else {
        const nameAndDegreeRegex = /^[a-zA-ZÀ-ỹ-\s]{5,}$/;
        if (
          !nameAndDegreeRegex.test(name) ||
          !nameAndDegreeRegex.test(degree)
        ) {
          toast.error("Tên hoặc bằng cấp không hợp lệ");
          return;
        }
        const response = await addInstructor(newInstructor, token);
        setInstructors([...instructors, response]);
        setNewInstructor({
          instructorId: "",
          name: "",
          degree: "",
          email: "",
          majorId: "",
        });

        console.log(newInstructor);
        toast.success("Thêm giảng viên thành công");
      }
    } catch (error) {
      console.error("Lỗi khi thêm giảng viên:", error);
      await toast.error("Lỗi khi thêm giảng viên!");
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await deleteInstructor(id, token);
      const updatedInstructors = await getInstructor(token);
      setInstructors(updatedInstructors);
      toast.success("Xóa Giảng Viên Thành công");
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <h3 className=" mt-2">Quản lí Giảng Viên</h3>
      <div className="control-container my-3 d-flex flex-wrap gap-2">
        <div className="control-item">
          <label htmlFor="instructorId" className="form-label">
            Mã Giảng Viên
          </label>
          <input
            type="text"
            className="form-control"
            id="instructorId"
            name="instructorId"
            value={newInstructor.instructorId}
            onChange={handleInputChange}
          />
        </div>
        <div className="control-item">
          <label htmlFor="name" className="form-label">
            Tên Giảng Viên
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={newInstructor.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="control-item">
          <label htmlFor="degree" className="form-label">
            Bằng Cấp
          </label>
          <input
            type="text"
            className="form-control"
            id="degree"
            value={newInstructor.degree}
            name="degree"
            onChange={handleInputChange}
          />
        </div>
        <div className="control-item">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={newInstructor.email}
            name="email"
            onChange={handleInputChange}
          />
        </div>
        <div className="control-item">
          <label htmlFor="major" className="form-label">
            Chuyên ngành
          </label>
          <select
            className="form-select"
            id="major"
            name="major"
            value={newInstructor.majorId}
            onChange={handleMajorChange}
          >
            <option value="">Chọn chuyên ngành</option>
            {majors.map((major) => (
              <option key={major._id} value={major._id}>
                {major.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="control-item d-flex gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddInstructor}
        >
          Thêm Giảng Viên
        </button>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Mã Giảng Viên</th>
              <th scope="col">Họ Tên Giảng Viên</th>
              <th scope="col">Bằng Cấp</th>
              <th scope="col">Email</th>
              <th scope="col">Khoa</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{instructor.instructorId}</td>
                <td>{instructor.name}</td>
                <td>{instructor.degree}</td>
                <td>{instructor.email}</td>
                <td>{majors.find((m) => m._id == instructor.majorId)?.name}</td>
                <td style={{ minWidth: "110px" }}>
                  <button
                    onClick={() => {
                      handleEditModal(instructor);
                    }}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(instructor._id)}
                    className="btn btn-danger mx-1"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
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
                <label htmlFor="instructorId" className="form-label">
                  Mã giảng viên
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="instructorId"
                  value={selectedInstructor?.instructorId || ""}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Tên giảng viên
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={selectedInstructor?.name || ""}
                  onChange={(e) =>
                    setSelectedInstructor({
                      ...selectedInstructor,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="degree" className="form-label">
                  Bằng cấp
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="degree"
                  value={selectedInstructor?.degree || ""}
                  onChange={(e) =>
                    setSelectedInstructor({
                      ...selectedInstructor,
                      degree: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={selectedInstructor?.email || ""}
                  onChange={(e) =>
                    setSelectedInstructor({
                      ...selectedInstructor,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label htmlFor="majorId" className="form-label">
                  Chuyên ngành
                </label>
                <select
                  className="form-select"
                  id="majorId"
                  value={selectedInstructor?.majorId || ""}
                  onChange={(e) =>
                    setSelectedInstructor({
                      ...selectedInstructor,
                      majorId: e.target.value,
                    })
                  }
                >
                  <option value="">Chọn chuyên ngành</option>
                  {majors.map((major) => (
                    <option key={major._id} value={major._id}>
                      {major.name}
                    </option>
                  ))}
                </select>
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
              onClick={handleEditInstructor}
              className="btn btn-primary mx-1"
            >
              Lưu thay đổi
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default InstructorManage;
