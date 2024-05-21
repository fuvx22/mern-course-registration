import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-modal";
import {
  addUser,
  fetchMajorsAPI,
  fetchUserAPI,
  getInstructor,
  getAllUser,
  deleteUserById,
  editUser,
  getImageUser,
} from "../apis";
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
const UserManage = () => {
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();
  const [majorName, setMajorName] = useState({
    name: "",
  });
  const token = JSON.parse(localStorage.getItem("user-token"));
  const [isOpen, setIsOpen] = useState(false);
  const [majors, setMajors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [imageUserSelected, setImageUserSelected] = useState(null);
  const closeModal = () => {
    setIsOpen(false);
  };
  const handleRoleChange = async (e) => {
    setSelectedRole(e.target.value);
    let responseUserByRole;
    if (e.target.value === "major") {
      setUser({
        userId: "",
        name: "",
        role: "major",
        password: "",
        phoneNumber: "",
        address: "",
        class: "not-student",
        AcademicAdvisor: "not-student",
        majorId: "not-student",
        specializedMajor: "not-student",
        academicYear: "not-student",
      });
      responseUserByRole = await getAllUser(token, "major");

      setAllUsers(responseUserByRole.data);
    } else {
      setUser({
        userId: "",
        name: "",
        phoneNumber: "",
        address: "",
        class: "",
        AcademicAdvisor: "",
        specializedMajor: "",
        academicYear: "",
        password: "",
        ethnic: "",
        religion: "",
        role: "student",
        majorId: "",
      });

      responseUserByRole = await getAllUser(token, "student");

      setAllUsers(responseUserByRole.data);
    }
  };

  const handleInputChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleMajorChange = (e) => {
    if (selectedRole === "major") {
      const selectedMajorId = e.target.value;
      setSelectedMajorId(selectedMajorId);
      const selectedMajor = majors.find(
        (major) => major.majorId === selectedMajorId
      );
      if (!selectedMajor) {
        return;
      }
      setUser({
        ...user,
        userId: selectedMajorId,
        name: selectedMajor.name,
      });
      setMajorName(selectedMajor.name);
    } else {
      setUser({
        ...user,
        majorId: e.target.value,
      });
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUser({
      ...user,
      image: file,
    });
  };
  const handleInstructorChange = (e) => {
    setUser({
      ...user,
      AcademicAdvisor: e.target.value,
    });
  };
  const handleAddUser = async () => {
    try {
      if (selectedRole === "major") {
        const { password, address, phoneNumber, userId, image, ...major } =
          user;
        if (
          password == "" ||
          address == "" ||
          phoneNumber == "" ||
          userId == "" ||
          image == undefined
        ) {
          toast.error("Vui lòng điền đầy đủ thông tin!");
          return;
        }
        const phoneNumberRegex = /^\d{10,11}$/; // Biểu thức chính quy kiểm tra số điện thoại có từ 10 đến 11 chữ số
        if (!phoneNumberRegex.test(phoneNumber)) {
          toast.error("Số điện thoại không hợp lệ!");
          return;
        }
        const userIdRegex = /^[a-zA-Z0-9]{5,10}$/;
        if (!userIdRegex.test(userId)) {
          toast.error("Mã khoa không hợp lệ!");
          return;
        }
        const regexAddress = /^[a-zA-Z0-9\s,-]+[\u00C0-\u017F\s,-]*$/;
        if (regexAddress.test(address)) {
          console.log(address);
          toast.error("Địa chỉ không hợp lệ!");
          return;
        }
        const formData = new FormData();
        Object.entries(user).forEach(([key, value]) => {
          formData.append(key, value);
        });
        const response = await addUser(formData, token);
        if (response) {
          setSelectedMajorId(null);
          setUser({
            userId: "",
            name: "",
            role: "major",
            password: "",
            phoneNumber: "",
            address: "",
            class: "not-student",
            majorId: "not-student",
            specializedMajor: "not-student",
            academicYear: "not-student",
          });
          const imageInput = document.getElementById("image");
          if (imageInput) {
            imageInput.value = null;
          }
          setAllUsers([...allUsers, response]);

          toast.success("Thêm tài khoản thành công!");
        }
      } else {
        const { password, address, phoneNumber, userId, image, ...student } =
          user;
        const isStudentEmpty = Object.values(student).some(
          (value) => value === ""
        );
        if (
          isStudentEmpty ||
          password === "" ||
          address === "" ||
          phoneNumber === "" ||
          userId === "" ||
          image === undefined
        ) {
          toast.error("Vui lòng điền đầy đủ thông tin!");
          return;
        }
        const phoneNumberRegex = /^\d{10,11}$/; // Biểu thức chính quy kiểm tra số điện thoại có từ 10 đến 11 chữ số
        const userIdRegex = /^[a-zA-Z0-9]{5,10}$/;
        if (!userIdRegex.test(userId)) {
          toast.error("Mã sinh viên không hợp lệ!");
          return;
        }
        if (!phoneNumberRegex.test(phoneNumber)) {
          toast.error("Số điện thoại không hợp lệ!");
          return;
        }
        const nameAndDegreeRegex = /^[a-zA-ZÀ-ỹ-\s]{4,}$/;
        if (
          !nameAndDegreeRegex.test(student.name) ||
          !nameAndDegreeRegex.test(student.specializedMajor) ||
          !nameAndDegreeRegex.test(student.ethnic) ||
          !nameAndDegreeRegex.test(student.religion)
        ) {
          toast.error("Tên hoặc các trường khác không hợp lệ");
          return;
        }
        const regexAddress = /^[a-zA-Z0-9\s,-]+[\u00C0-\u017F\s,-]*$/;
        if (regexAddress.test(address)) {
          toast.error("Địa chỉ không hợp lệ!");
          return;
        }
        const regexAcademicYear = /^\d{4}-\d{4}$/;
        if (!regexAcademicYear.test(student.academicYear)) {
          toast.error("Niên khóa không hợp lệ!");
          return;
        }
        const formData = new FormData();
        Object.entries(user).forEach(([key, value]) => {
          formData.append(key, value);
        });
        const response = await addUser(formData, token);
        if (response) {
          setUser({
            userId: "",
            name: "",
            role: "student",
            password: "",
            phoneNumber: "",
            address: "",
            class: "",
            majorId: "",
            specializedMajor: "",
            academicYear: "",
            AcademicAdvisor: "",
          });
          const imageInput = document.getElementById("image");
          if (imageInput) {
            imageInput.value = null;
          }
          setAllUsers([...allUsers, response]);
          toast.success("Thêm tài khoản thành công!");
        }
      }
    } catch (error) {
      toast.error(error.response.data.error);
      console.log(error.message);
    }
  };
  const handleDeleteUser = async (id) => {
    try {
      const response = await deleteUserById(token, id);
      console.log(selectedRole);
      const responseUserByRole = await getAllUser(token, selectedRole);
      setAllUsers(responseUserByRole.data);
      toast.success("Xóa tài khoản thành công!");
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleOpenEdit = async (user) => {
    setSelectedUser(user);
    setIsOpen(true);
    const imageUserSelected = await getImageUser(token, user.image);
    const imageURL = URL.createObjectURL(imageUserSelected.data);
    setImageUserSelected(imageURL);
  };
  const handleEditUser = async () => {
    if (selectedRole === "student") {
      const { password, address, phoneNumber, userId, ...student } =
        selectedUser;
      const isStudentEmpty = Object.values(student).some(
        (value) => value === ""
      );
      if (
        isStudentEmpty ||
        password === "" ||
        address === "" ||
        phoneNumber === "" ||
        userId === ""
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      const phoneNumberRegex = /^\d{10,11}$/; // Biểu thức chính quy kiểm tra số điện thoại có từ 10 đến 11 chữ số
      const userIdRegex = /^[a-zA-Z0-9]{5,10}$/;
      if (!userIdRegex.test(userId)) {
        toast.error("Mã sinh viên không hợp lệ!");
        return;
      }
      if (!phoneNumberRegex.test(phoneNumber)) {
        toast.error("Số điện thoại không hợp lệ!");
        return;
      }
      const nameAndDegreeRegex = /^[a-zA-ZÀ-ỹ-\s]{4,}$/;
      if (
        !nameAndDegreeRegex.test(student.name) ||
        !nameAndDegreeRegex.test(student.specializedMajor) ||
        !nameAndDegreeRegex.test(student.ethinic) ||
        !nameAndDegreeRegex.test(student.religion)
      ) {
        toast.error("Tên hoặc các trường khác không hợp lệ");
        return;
      }
      const regexAcademicYear = /^\d{4}-\d{4}$/;
      if (!regexAcademicYear.test(student.academicYear)) {
        toast.error("Niên khóa không hợp lệ!");
        return;
      }
    } else {
      const { password, address, phoneNumber, userId, image, ...major } =
        selectedUser;
      const isMajorEmpty = Object.values(major).some((value) => value === "");
      if (
        isMajorEmpty ||
        password === "" ||
        address === "" ||
        phoneNumber === "" ||
        userId === ""
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      const phoneNumberRegex = /^\d{10,11}$/; // Biểu thức chính quy kiểm tra số điện thoại có từ 10 đến 11 chữ số
      const userIdRegex = /^[a-zA-Z0-9]{5,10}$/;
      if (!userIdRegex.test(userId)) {
        toast.error("Mã khoa không hợp lệ!");
        return;
      }
      if (!phoneNumberRegex.test(phoneNumber)) {
        toast.error("Số điện thoại không hợp lệ!");
        return;
      }
      const regexAddress = /^\d+[\s/,-]*[\w\s,-]+$/;
      if (!regexAddress.test(address)) {
        toast.error("Địa chỉ không hợp lệ!");
        return;
      }
    }
    const formData = new FormData();
    Object.entries(selectedUser).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const response = await editUser(token, formData);
    const updatedUser = await getAllUser(token, selectedRole);
    setAllUsers(updatedUser.data);
    closeModal();
    toast.success("Chỉnh sửa tài khoản thành công!");
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
  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <h3 className=" mt-2">Quản lí Tài Khoản</h3>{" "}
      <div className="control-container my-3 ">
        <div className="control-item">
          <label htmlFor="role" className="form-label">
            Quyền Tài Khoản
          </label>
          <select
            className="form-select"
            id="role"
            name="role"
            onChange={handleRoleChange}
            value={selectedRole}
            style={{ width: "250px" }}
          >
            <option value="">Chọn Quyền</option>
            <option value="student">Sinh Viên</option>
            <option value="major">Khoa</option>
          </select>
        </div>
        {selectedRole === "major" && (
          <div>
            <div className="control-container my-3 d-flex flex-wrap gap-3">
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Mã Khoa
                </label>
                <select
                  className="form-select"
                  id="major"
                  name="major"
                  value={user.userId}
                  onChange={handleMajorChange}
                >
                  <option value="">Chọn Khoa</option>
                  {majors.map((major) => (
                    <option key={major._id} value={major.majorId}>
                      {major.majorId} - {major.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Tên khoa
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="majorName"
                  name="name"
                  value={selectedMajorId ? majorName : ""}
                  disabled
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Địa Chỉ
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={user.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="majorName"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Mật Khẩu
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Hình Ảnh
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleAddUser}>
              Thêm Tài Khoản
            </button>
          </div>
        )}
        {selectedRole === "student" && (
          <div>
            <div className="control-container my-3 d-flex flex-wrap gap-3">
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Mã Sinh Viên
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="majorId"
                  name="userId"
                  value={user.userId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Mật Khẩu
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Tên Sinh viên
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="majorId"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Địa Chỉ
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={user.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Lớp
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="class"
                  name="class"
                  value={user.class}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Khoa
                </label>
                <select
                  className="form-select"
                  id="major"
                  name="major"
                  value={user.majorId}
                  onChange={handleMajorChange}
                >
                  <option value="">Chọn Khoa</option>
                  {majors.map((major) => (
                    <option key={major._id} value={major._id}>
                      {major.majorId} - {major.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Chuyên Ngành
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="specializedMajor"
                  name="specializedMajor"
                  value={user.specializedMajor}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Niên khóa
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="academicYear"
                  name="academicYear"
                  value={user.academicYear}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Dân Tộc
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ethnic"
                  name="ethnic"
                  value={user.ethnic}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Tôn Giáo
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="religion"
                  name="religion"
                  value={user.religion}
                  onChange={handleInputChange}
                />
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Cố Vấn Học Tập
                </label>
                <select
                  className="form-select"
                  id="AcademicAdvisor"
                  name="AcademicAdvisor"
                  value={user.AcademicAdvisor}
                  onChange={handleInstructorChange}
                >
                  <option value="">Chọn Cố Vấn Học Tập</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor.name}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-item">
                <label htmlFor="majorId" className="form-label">
                  Hình Ảnh
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleAddUser}>
              Thêm Tài Khoản
            </button>
          </div>
        )}
      </div>
      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              {selectedRole === "student" ? (
                <th scope="col">Mã sinh viên</th>
              ) : (
                <th scope="col">Mã Khoa</th>
              )}
              {selectedRole === "student" ? (
                <th scope="col">Họ Tên</th>
              ) : (
                <th scope="col">Tên Khoa</th>
              )}
              <th scope="col">Số Điện Thoại</th>
              <th scope="col">Địa Chỉ</th>
              {selectedRole === "student" && (
                <React.Fragment>
                  <th scope="col">Lớp</th>
                  <th scope="col">Khoa</th>
                  <th scope="col">Chuyên Ngành</th>
                  <th scope="col">Niên Khóa</th>
                  <th scope="col">Dân Tộc</th>
                  <th scope="col">Tôn Giáo</th>
                  <th scope="col">Cố Vấn học tập</th>
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {selectedRole
              ? allUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.userId}</td>
                    <td>{user.name}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.address}</td>
                    {selectedRole === "student" && (
                      <React.Fragment>
                        <td>{user.class}</td>
                        <td>
                          {majors.find((m) => m._id == user.majorId)?.name}
                        </td>
                        <td>{user.specializedMajor}</td>
                        <td>{user.academicYear}</td>
                        <td>{user.ethnic}</td>
                        <td>{user.religion}</td>
                        <td>{user.AcademicAdvisor}</td>
                      </React.Fragment>
                    )}
                    <td style={{ minWidth: "110px" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-danger mx-1"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              : null}
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
              <div className="row mb-3">
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="instructorId" className="form-label">
                    {selectedRole === "student" ? "Mã sinh viên" : "Mã khoa"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="instructorId"
                    value={selectedUser?.userId || ""}
                    readOnly
                  />
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="name" className="form-label">
                    {selectedRole === "student" ? "Họ Tên" : "Tên khoa"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={selectedUser?.name || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="degree" className="form-label">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="degree"
                    value={selectedUser?.phoneNumber || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="email" className="form-label">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    value={selectedUser?.address || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              {selectedRole === "student" && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-4 col-sm-12">
                      <label htmlFor="majorId" className="form-label">
                        Khoa
                      </label>
                      <select
                        className="form-select"
                        id="majorId"
                        value={selectedUser?.majorId || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
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
                    <div className="col-md-4 col-sm-12">
                      <label htmlFor="specializedMajor" className="form-label">
                        Chuyên ngành
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="specializedMajor"
                        value={selectedUser?.specializedMajor || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            specializedMajor: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-4 col-sm-12">
                      <label htmlFor="academicYear" className="form-label">
                        Niên khóa
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="academicYear"
                        value={selectedUser?.academicYear || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            academicYear: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 col-sm-12">
                      <label htmlFor="ethnic" className="form-label">
                        Dân tộc
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ethnic"
                        value={selectedUser?.ethnic || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            ethnic: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-4 col-sm-12">
                      <label htmlFor="religion" className="form-label">
                        Tôn giáo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="religion"
                        value={selectedUser?.religion || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            religion: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-4 col-sm-12">
                      <label htmlFor="majorId" className="form-label">
                        Cố Vấn học tập
                      </label>
                      <select
                        className="form-select"
                        id="AcademicAdvisor"
                        value={selectedUser?.AcademicAdvisor || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            AcademicAdvisor: e.target.value,
                          })
                        }
                      >
                        <option value="">Chọn cố vấn học tập</option>
                        {instructors.map((instructor) => (
                          <option key={instructor._id} value={instructor.name}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              <div className="row mb-3">
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={selectedUser?.password || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="religion" className="form-label">
                    Hình ảnh
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        image: e.target.files[0],
                      })
                    }
                  />
                  <input
                    type="text"
                    className="form-control"
                    id="imageText"
                    value={selectedUser?.image || ""}
                    onChange={(e) => {
                      setSelectedUser({
                        ...selectedUser,
                        image: e.target.value,
                      });
                    }}
                    hidden
                  />
                  <div className="mt-3">
                    <label htmlFor="">Hình ảnh hiện tại</label>
                  </div>

                  <img
                    src={imageUserSelected}
                    alt=""
                    className="rounded-circle img-fluid mt-2"
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
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
              onClick={handleEditUser}
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

export default UserManage;
