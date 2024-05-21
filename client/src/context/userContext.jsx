import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";

import { API_ROOT } from "../utils/constants";
import { fetchUserAPI, getImageUser } from "../apis";
export const UserContext = createContext();
// export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [imageUser, setImageUser] = useState(null);
  const [error, setError] = useState(null);
  let token = JSON.parse(localStorage.getItem("user-token"));
  const login = async (tk) => {
    try {
      token = tk;
      const response = await fetchUserAPI(token);
      const responseImage = await getImageUser(token, response.data.image);
      const imageURL = URL.createObjectURL(responseImage.data);
      setImageUser(imageURL);
      setUserData(response.data);
      setRole(response.data.role);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };
  const fetchUserData = async (token) => {
    try {
      const response = await fetchUserAPI(token);
      setUserData(response.data);
      setRole(response.data.role);
      // console.log(response.data);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };
  useEffect(() => {
    if (!token) {
      return;
    } else {
      fetchUserData(token);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userData, error, login, role, imageUser }}>
      {children}
    </UserContext.Provider>
  );
};
