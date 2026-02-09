import axios from "axios";

const SERVER_API_BASE_URL =
  process.env["USER_SERVICE_URL"] ||
  process.env["NEXT_PUBLIC_USER_SERVICE_URL"] ||
  "http://localhost:3001/api";

const serverApi = axios.create({
  baseURL: SERVER_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default serverApi;
