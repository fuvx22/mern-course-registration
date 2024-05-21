import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./assets/index.css";
import "./assets/responsive.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Nhúng Bootstrap CSS
import "@fortawesome/fontawesome-free/css/all.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
Modal.setAppElement("#root");
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <App />
    <ToastContainer />
  </>
);
