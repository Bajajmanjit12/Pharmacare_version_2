import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);

    const handleSetActive = (path) => {
        setActive(path);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link
                    to="/"
                    className="brand"
                    onClick={() => handleSetActive("/")}
                >
                    PharmaCare
                </Link>
            </div>

            <div className="navbar-center">
                <Link
                    to="/"
                    className={active === "/" ? "active-link" : ""}
                    onClick={() => handleSetActive("/")}
                >
                    Home
                </Link>

                <Link
                    to="/about"
                    className={active === "/about" ? "active-link" : ""}
                    onClick={() => handleSetActive("/about")}
                >
                    About
                </Link>

                <Link
                    to="/editions"
                    className={active === "/editions" ? "active-link" : ""}
                    onClick={() => handleSetActive("/editions")}
                >
                    Editions
                </Link>

                <Link
                    to="/specials"
                    className={active === "/specials" ? "active-link" : ""}
                    onClick={() => handleSetActive("/specials")}
                >
                    Specials
                </Link>

                <Link
                    to="/articles"
                    className={active === "/articles" ? "active-link" : ""}
                    onClick={() => handleSetActive("/articles")}
                >
                    Articles
                </Link>


                <Link
                    to="/contact"
                    className={active === "/contact" ? "active-link" : ""}
                    onClick={() => handleSetActive("/contact")}
                >
                    Contact
                </Link>
            </div>

            <div className="navbar-right">
                <Link to="/admin" className="admin-btn">
                    Admin
                </Link>
            </div>
        </nav>
    );
}
