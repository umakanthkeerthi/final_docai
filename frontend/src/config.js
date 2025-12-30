// Smart Configuration - Automatically selects the correct API
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE = isLocal
    ? "http://127.0.0.1:8002/api"                // Dev: Local Backend
    : "https://docai-backend-xd4x.onrender.com/api"; // Prod: Render Backend
