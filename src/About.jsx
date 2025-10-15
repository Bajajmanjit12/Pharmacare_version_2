import React from "react";
import "./About.css";
import founder from "./assets/founder.jpg"; // Make sure the founder image is in src/assets

export default function About() {
    return (
        <section className="about-section">
            <div className="about-container">

                {/* Left Side - Founder */}
                <div className="founder-side">
                    <div className="founder-photo-wrapper">
                        <img src={founder} alt="Founder" className="founder-photo" />
                    </div>
                    <h3 className="founder-name">Atul Jhalke</h3>
                    <p className="founder-title">Founder & Visionary</p>
                </div>

                {/* Right Side - Vision & Editors */}
                <div className="vision-side">
                    <h2 className="vision-title">Our Vision</h2>
                    <p className="vision-description">
                        PharmaCare has been dedicated to delivering insightful health news, trusted pharmaceutical updates, and reliable healthcare knowledge.

                        Our goal is to empower readers with accurate information that helps them make better health decisions — one edition at a time.
                    </p>
                    <div className="editors">
                        <p><strong>Editor:</strong> Atul Jhalke</p>
                        <p><strong>Executive Editor:</strong> Ravindra Pawar</p>
                        <p><strong>Associate Editor:</strong> Sachin Valunj</p>
                    </div>
                </div>


            </div>

        </section>
    );
}