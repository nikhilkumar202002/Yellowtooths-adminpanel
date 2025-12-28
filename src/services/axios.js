import axios from "axios";

const api = axios.create({
  baseURL: "https://yt.jinskadamthodu.com/public/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;