import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [isLoading, setIsLoading] = useState(true);

    // API URL from environment variables
    const API = import.meta.env.VITE_APP_URI_API;

    return (

        <AuthContext.Provider
            value={{
                isLoading,
                API,
            }}>
            {children}
        </AuthContext.Provider>
    )
}


// Custom hook to use AuthContext
export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth must be used within the AuthProvider");
    }
    return authContextValue;
};