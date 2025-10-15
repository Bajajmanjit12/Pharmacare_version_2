import React, { useState } from "react";
import "./ContactUs.css";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";

const ContactUs = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await axios.post("http://localhost:5000/api/contact/send", form);
            if (res.data.success) {
                alert("Message sent successfully!");
                setForm({ name: "", email: "", message: "" }); // reset form
            } else {
                alert("Failed to send message: " + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
                Have questions, suggestions, or feedback? We'd love to hear from you.
                Get in touch with our team.
            </p>

            <div className="contact-container">
                {/* Left Box - Send Message */}
                <div className="contact-box">
                    <h2>Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="message"
                            placeholder="Message"
                            rows="5"
                            value={form.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>

                {/* Right Box - Get in Touch */}
                <div className="contact-box">
                    <h2>Get in Touch</h2>
                    <div className="contact-info">
                        <FaEnvelope className="icon" />
                        <div>
                            <h4>Email Address</h4>
                            <p>pharmacare0823@gmail.com</p>
                        </div>
                    </div>
                    <div className="contact-info">
                        <FaPhone className="icon" />
                        <div>
                            <h4>Phone Numbers</h4>
                            <p>+91 98229 54912</p>
                            <p>+91 97658 00266</p>
                            <p>+91 94220 21419</p>
                        </div>
                    </div>
                    <div className="contact-info">
                        <FaMapMarkerAlt className="icon" />
                        <div>
                            <h4>Address</h4>
                            <p>
                                A/P Baragaon-Pimpri, Tal.Sinnar, Dist.Nashik-422103
                                Published at Flat No.8, Atharv Apartment, Vijay Nagar, Sinnar, Dist.Nashik, Pin Code-422103, Maharashtra
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
