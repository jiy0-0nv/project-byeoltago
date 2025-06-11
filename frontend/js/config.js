const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/api/v1"
    : "https://your-api.example.com/api/v1";

export { API_BASE_URL };