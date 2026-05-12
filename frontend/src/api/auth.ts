import api from "./axios";

// Login
export const loginUser = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });
    return response.data;
}

// Register
export const registerUser = async (data: {name: string, email: string, password: string}) => {
    const response = await api.post("/auth/register", data);
    return response.data;
}

// Get current user
export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
}