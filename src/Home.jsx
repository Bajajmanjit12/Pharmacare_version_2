import React from "react";
import "./Home.css";

export default function Home() {
    return (
        <section className="hero-section">
            <div className="hero-container">
                {/* Marathi Section */}
                <div className="hero-text marathi">
                    <div className="text-block">
                        <h1>फार्मकेअर</h1>
                        <h2>आपला विश्वासार्ह आरोग्य साथी</h2>
                        <p>
                            फार्मकेअर आपल्याला नवीनतम बातम्या, आरोग्य टिप्स आणि औषधी अद्यतन
                            उपलब्ध करून देते.
                        </p>
                    </div>
                </div>

                {/* English Section */}
                <div className="hero-text english">
                    <div className="text-block">
                        <h1>PharmaCare</h1>
                        <h2>Your Trusted Health Companion</h2>
                        <p>
                            PharmaCare brings you the latest news, health tips, and pharmaceutical updates.
                            Stay informed and stay healthy!
                        </p>
                    </div>
                </div>
            </div>

            {/* Browse Editions Button */}
            <div className="browse-wrapper">
                <button className="browse-btn">Browse Editions</button>
            </div>

            {/* Floating Bubbles */}
            <div className="bubbles">
                <div className="bubble bubble1"></div>
                <div className="bubble bubble2"></div>
                <div className="bubble bubble3"></div>
                <div className="bubble bubble4"></div>
                <div className="bubble bubble5"></div>
                <div className="bubble bubble6"></div>
                <div className="bubble bubble7"></div>
                <div className="bubble bubble8"></div>
            </div>
        </section>
    );
}