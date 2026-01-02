import axios from "axios";

const api = axios.create({
  baseURL: "https://devyt.jinskadamthodu.com/public/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;