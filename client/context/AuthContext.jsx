import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check authentication
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  // Login / Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(
        `/api/auth/${state}`,
        credentials
      );

      if (data.success) {
        setAuthUser(data.userData);

        connectSocket(data.userData);

        axios.defaults.headers.common["token"] = data.token;

        setToken(data.token);

        localStorage.setItem("token", data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    delete axios.defaults.headers.common["token"];

    socket?.disconnect();
    setSocket(null);

    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put(
        "/api/auth/update-profile",
        body
      );

      if (data.success) {
        setAuthUser(data.user);

        toast.success(
          "Profile updated successfully"
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendURL, {
      query: {
        userId: userData._id,
      },
    });

    setSocket(newSocket);

    newSocket.on(
      "getOnlineUsers",
      (userIds) => {
        setOnlineUsers(userIds);
      }
    );
  };

  // Check auth when app starts
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }

    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};