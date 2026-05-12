import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e: React.SubmitEvent) => {
        e.preventDefault();
        try {
            const response = await registerUser(form);
            localStorage.setItem("access_token", response.access_token);
            navigate("/");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed");
        }
    }

    return (
        <div className="p-10 text-2xl font-bold">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-2 py-1"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-2 py-1"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-2 py-1"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Register
                </button>
            </form>
        </div>
    );
}