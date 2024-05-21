import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { fetchUserAPI } from "../apis";
import {
  fetchMajorsAPI,
  createNewMajorAPI,
  editMajorAPI,
  deleteMajorAPI,
} from "../apis";
import { majorErrorClassify } from "../utils/validator";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

let indexToEdit = -1;

const customStyles = {
  content: {
    width: "30%",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

function MajorManage() {
  const [majors, setMajors] = useState([]);
  const { userData } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState(null)
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
        const respone = await fetchUserAPI(token);
        if (respone.data.role == "admin" || respone.data.role === "major") {
          const data = await fetchMajorsAPI(token);
          setMajors(data);
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

  let typesData = [
    {
      _id: "66082050bf95182f67b4317c",
      name: "Sư phạm",
    },
    {
      _id: "6608209bbf95182f67b4317d",
      name: "Ngoài sư phạm",
    },
  ];

  const navigate = useNavigate();
  const [majorId, setMajorId] = useState("");
  const [majorName, setMajorName] = useState("");
  const [majorType, setMajorType] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [types, setTypes] = useState(typesData);
  const majorIdRef = useRef(null);

  const handleAddMajor = async () => {
    if (majorId && majorName && majorType != "default" && majorType != "") {
      try {
        const newMajor = {
          majorId: majorId,
          name: majorName,
          type: majorType,
        };

        const createdMajor = await createNewMajorAPI(newMajor, token);
        setMajors([...majors, createdMajor]);
        cancelActivity();
        toast.success("Thêm khoa thành công");
      } catch (error) {
        toast.error(majorErrorClassify(error), {
          position: "top-center",
          theme: "colored",
        });
      }
    } else {
      toast.error("Vui lòng không bỏ trống thông tin", {
        position: "top-center",
        theme: "colored",
      });
      majorIdRef.current.focus();
    }
  };


  const confirmEdit = async () => {
    const { majorId, name, type} = selectedMajor;
    if (
      majorId != "" ||
      name != "" ||
      type != "" 
    ) {
      try {
        await editMajorAPI(selectedMajor);
        const updatedMajor = await fetchMajorsAPI(token);
        setMajors(updatedMajor);
        toast.success("Cập nhật khoa thành công");
        closeModal();
      } catch (error) {
        toast.error(majorErrorClassify(error), {
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
      majorIdRef.current.focus();
    }
  };

  const handleEditModal = async (major) => {
    setSelectedMajor(major)
    setIsOpen(true);
  };

  

  const handleDeleteMajor = async (index) => {
    try {
      const majorsToEdit = [...majors];
      await deleteMajorAPI(majorsToEdit[index]);
      majorsToEdit.splice(index, 1);
      setMajors(majorsToEdit);
      toast.success("Xóa thành công", {
        position: "top-left",
      });
    } catch (error) {
      throw new Error(error);
    }
  };

  const cancelActivity = () => {
    setMajorId("");
    setMajorName("");
    setMajorType("");
    setIsEdit(false);
    indexToEdit = -1;
  };

  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />

      <div className="control-container my-3 d-flex flex-wrap gap-2">
        <div className="control-item">
          <label htmlFor="majorId" className="form-label">
            Mã khoa
          </label>
          <input
            ref={majorIdRef}
            value={majorId}
            onChange={(e) => {
              setMajorId(e.target.value);
            }}
            type="text"
            className="form-control"
            id="majorId"
          />
        </div>
        <div className="control-item">
          <label htmlFor="majorName" className="form-label">
            Tên khoa
          </label>
          <input
            value={majorName}
            onChange={(e) => {
              setMajorName(e.target.value);
            }}
            type="text"
            className="form-control"
            id="majorName"
          />
        </div>
        <div className="control-item">
          <label htmlFor="majorType" className="form-label">
            Nhóm ngành
          </label>
          <select
            value={majorType}
            className="form-select"
            id="majorType"
            defaultValue={"default"}
            onChange={(e) => setMajorType(e.target.value)}
          >
            <option value="default">Chọn nhóm ngành</option>
            {types.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-item"></div>
        <div className="control-item d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={handleAddMajor}
          >
            Thêm khoa mới
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
              <th scope="col">Mã khoa</th>
              <th scope="col">Tên khoa</th>
              <th scope="col">Nhóm ngành</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {majors.map((major, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{major.majorId}</td>
                <td>{major.name}</td>
                <td>{types.find((m) => m._id == major.type)?.name}</td>
  
                <td style={{ minWidth: "110px", textAlign: "right" }}>
                  <button
                    onClick={() => {
                      handleEditModal(major);
                    }}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                      onClick={() => handleDeleteMajor(index)}
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
                <label htmlFor="majorId" className="form-label">
                  Mã khoa
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="majorId"
                  value={selectedMajor?.majorId || ""}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Tên khoa
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={selectedMajor?.name || ""}
                  onChange={(e) =>
                    setSelectedMajor({
                      ...selectedMajor,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label htmlFor="type" className="form-label">
                  Nhóm ngành
                </label>
                <select
                  className="form-select"
                  id="type"
                  value={selectedMajor?.type || ""}
                  onChange={(e) =>
                    setSelectedMajor({
                      ...selectedMajor,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="">Chọn nhóm ngành</option>
                  {typesData.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
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

export default MajorManage;
