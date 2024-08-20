// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://zzfutebolstore-api.onrender.com/api",
});

export default api;
