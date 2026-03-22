import axios from "axios";

const api = axios.create({
  baseURL: "https://movieswebsite-yvlx.onrender.com/api"
});

export default api;