import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import About from "./About";
import Editions from "./Editions";
import Specials from "./Specials";
import Contact from "./ContactUs";
import Admin from "./Admin";
import Articles from "./Articles";  // 👈 NEW import
import Footer from "./Footer";
import "./App.css";

// Homepage: Home + Specials
function HomePage() {
    return (
        <div>
            <div id="home"><Home /></div>
            <div id="specials"><Specials /></div>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/editions" element={<Editions />} />
                    <Route path="/specials" element={<Specials />} />
                    <Route path="/articles" element={<Articles />} /> {/* 👈 NEW route */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>

                <Footer />
            </div>
        </Router>
    );
}
