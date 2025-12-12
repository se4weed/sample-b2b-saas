import axios from "axios";

axios.interceptors.request.use((config) => {
  const csrfToken = document.cookie.match(/X-CSRF-Token=([^;]+)/)?.[1] || "";
  config.headers.set("X-CSRF-Token", csrfToken);
  config.headers.set("Accept", "application/json");
  config.withCredentials = true;
  return config;
});

export default axios;
