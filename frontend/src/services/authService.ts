import api from "./api";

export const loginUser = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData);
    return response.data;
}

export const registerUser = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
        name,
        email,
        password,
    });
    
    return response.data;
}