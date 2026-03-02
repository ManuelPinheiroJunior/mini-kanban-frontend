import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "https://mini-kanban-backend.vercel.app";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});
