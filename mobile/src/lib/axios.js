import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.2:3000",
  timeout: 1000 * 10,
});
