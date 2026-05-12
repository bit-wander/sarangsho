import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../api/auth";

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    const loadUser = async () => {

        const token = localStorage.getItem("access_token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await getCurrentUser();
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
            localStorage.removeItem("access_token");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

