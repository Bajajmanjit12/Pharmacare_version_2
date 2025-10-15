import React, { useState } from "react";
import AdminPanel from "./AdminPanel";
import "./Admin.css"; // ✅ import CSS

export default function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        const email = (credentials.email || "").trim().toLowerCase();

        if (email === "admin@example.com" && credentials.password === "password") {
            setIsLoggedIn(true);
            setError("");
        } else {
            setError("Invalid email or password ❌");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCredentials({ email: "", password: "" });
    };

    if (isLoggedIn) {
        return <AdminPanel onLogout={handleLogout} />;
    }

    return (
        <div className="admin-wrapper">
            <div className="admin-box">
                <h2>Admin Login</h2>

                <form className="login-form" onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        placeholder="admin@example.com"
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        placeholder="Password"
                        required
                    />

                    {error && <div className="error-msg">{error}</div>}

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}