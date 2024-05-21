import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import {
  fetchNotifiesAPI,
  createNewNotifyAPI,
  editNotifyAPI,
  deleteNotifyAPI,
} from "../apis";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { modalStyles } from "../utils/constants";
import { EditorState, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { convertToRaw } from "draft-js";
import axios from "axios";

function NotifyManage() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [notifies, setNotifies] = useState([]);
  const [current, setCurrent] = useState({
    title: "",
    content: "",
    authorId: "",
  });
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user-token"));
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState();

  const removeState = () => {
    setEditorState(EditorState.createEmpty());
    setCurrent({
      ...current,
      title: "",
      content: "",
    });
  };

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleCreateClick = () => {
    removeState();
    openModal();
    setStatus("Thêm mới");
  };

  const handleEditBtnClick = (id) => {
    openModal();
    setStatus("Chỉnh sửa");
    const notifyToEdit = notifies.find((n) => n._id === id);
    const blocksFromHtml = htmlToDraft(notifyToEdit.content);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap
    );
    const editorStateToEdit = EditorState.createWithContent(contentState);
    setEditorState(editorStateToEdit);
    setCurrent({
      _id: id,
      title: notifyToEdit.title,
      content: notifyToEdit.content,
    });
  };

  const handleDeleteBtnClick = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await deleteNotifyAPI({ _id: id });
        const idx = notifies.findIndex((n) => n._id == id);
        let newNotifies = [...notifies];
        newNotifies.splice(idx, 1);
        setNotifies(newNotifies);
        toast.success("Xóa thành công");
      } catch (error) {
        toast.error("Xóa không thành công");
      }
    }
  };

  const handleInputChange = (e) => {
    setCurrent({
      ...current,
      [e.target.name]: e.target.value,
    });
  };

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    setCurrent({
      ...current,
      content: draftToHtml(convertToRaw(editorState.getCurrentContent())),
    });
  };

  const handleSaveBtnClick = async () => {
    current.authorId = userData._id;
    current.title = current.title.trim();
    current.content = current.content.trim();
    try {
      if (status === "Thêm mới") {
        delete current._id;
        const newNotify = await createNewNotifyAPI(current, token);
        setNotifies([...notifies, newNotify]);
      } else if (status === "Chỉnh sửa") {
        const editedNotify = await editNotifyAPI(current);
        const idx = notifies.findIndex((n) => n._id == current._id);

        notifies.splice(idx, 1, editedNotify);
        setNotifies(notifies);
      }
      toast.success(status + " thông báo thành công");
      closeModal();
      removeState();
    } catch (error) {
      toast.error("Thông tin không hợp lệ!");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        if (userData?.role === "admin" || userData?.role === "major") {
          const notifies = await fetchNotifiesAPI(token);
          setNotifies(notifies);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error("Không thể kết nối đến server");
      }
    };

    if (userData) {
      fetchData();
    }
  }, [userData]);

  //  async function uploadImageCallBack(file) {
  //   try {
  //     const formData = new FormData();
  //     formData.append('image', file);
  //     console.log(formData);
  //     // Gửi yêu cầu POST đến API của ImgBB
  //     const response = await axios.post('https://api.imgbb.com/1/upload', {
  //       key: '8f1990d09f4b09b6cf0770b4183e116d',
  //       body: formData,
  //     });

  //     // Trả về URL của ảnh đã tải lên
  //     return response.data.data.url;
  //   } catch (error) {
  //     console.error('Lỗi khi tải lên ảnh:', error);
  //     throw error;
  //   }
  //   }

  return (
    <div className="col-12 col-sm-10 col-md-8 m-auto">
      <Navbar user={userData} />
      <h3 className="mt-3">Quản lý thông báo</h3>
      <div className="my-3">
        <button className="btn btn-primary" onClick={handleCreateClick}>
          Tạo thông báo mới
        </button>
      </div>

      <div className="table-container table-responsive">
        <table className="table table-hover table-sm ">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Tiêu đề</th>
              <th scope="col">Nội dung thông báo</th>
              <th scope="col">tác giả</th>
              <th scope="col">thời gian tạo</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {notifies.map((n, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{n?.title}</td>
                <td className="truncate" style={{ maxWidth: "400px" }}>
                  {n?.content}
                </td>
                <td>{n.author ? n?.author[0]?.name : userData.name}</td>
                <td>{new Date(n?.createAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => {
                      handleEditBtnClick(n?._id);
                    }}
                    type="button"
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      handleDeleteBtnClick(n?._id);
                    }}
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
      <Modal
        style={modalStyles}
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel=""
      >
        <div className="modal-header">
          <h4 className="modal-title">{status} thông báo</h4>
        </div>
        <div className="mb-2">
          <label htmlFor="title" className="form-label">
            Tiêu đề thông báo
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            onChange={handleInputChange}
            value={current?.title}
          />
        </div>
        <div className="mb-2" style={{ height: "75%" }}>
          <label htmlFor="content" className="form-label">
            Nội dung thông báo
          </label>
          <Editor
            id="content"
            wrapperClassName="mb-3 editor-wrapper"
            editorClassName="mt-3 form-control notify-editor"
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
            toolbar={{
              inline: { inDropdown: false },
              list: { inDropdown: true },
              textAlign: { inDropdown: false },
              link: { inDropdown: true },
              history: { inDropdown: true },
              // image: {
              //   uploadCallback: uploadImageCallBack,
              //   alt: { present: true, mandatory: true },
              // },
            }}
          />
        </div>
        <div
          className="d-flex justify-content-end gap-2"
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
          <button
            className="btn btn-danger px-5"
            onClick={() => {
              closeModal();
              removeState();
            }}
          >
            Hủy
          </button>
          <button className="btn btn-primary px-5" onClick={handleSaveBtnClick}>
            Lưu
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default NotifyManage;
