import axios from "axios";

// 启动 json-server: npx json-server -p 3500 -w data/db.json
// Axios 文档: https://axios-http.com/docs/intro

export default axios.create({
  baseURL: "http://localhost:3500"
});