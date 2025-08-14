import React, { useState } from "react";

const ContactSupport: React.FC = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !message) {
            setError("Please fill out all fields.");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fromEmail: email, message }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to send email");
            }

            setSubmitted(true);

            setEmail("");
            setMessage("");
        } catch (err: any) {
            console.error(err);
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#1b1b1b",
                color: "#00ffcc",
                fontFamily: "'Press Start 2P', cursive",
                padding: "40px 20px",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    maxWidth: "600px",
                    backgroundColor: "#000",
                    border: "3px solid #00ffcc",
                    borderRadius: "10px",
                    padding: "30px",
                    textAlign: "left",
                }}
            >
                <h1
                    style={{
                        fontSize: "1.5rem",
                        marginBottom: "20px",
                        color: "#fff",
                    }}
                >
                    Contact Support
                </h1>

                {submitted ? (
                    <p style={{ lineHeight: 1.8, color: "#0f0" }}>
                        ✅ Thank you! Your message has been sent.
                    </p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                        }}
                    >
                        {error && <p style={{ color: "#ff5555" }}>{error}</p>}

                        <input
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                            required
                        />

                        <textarea
                            placeholder="Your Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{
                                ...inputStyle,
                                height: "150px",
                                resize: "none",
                            }}
                            required
                        />

                        <button type="submit" style={buttonStyle}>
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    padding: "10px",
    border: "2px solid #00ffcc",
    backgroundColor: "#000",
    color: "#00ffcc",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "0.8rem",
    outline: "none",
};

const buttonStyle: React.CSSProperties = {
    padding: "10px",
    border: "2px solid #fff",
    backgroundColor: "#0011ff",
    color: "#fff",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "0.8rem",
    cursor: "pointer",
};

export default ContactSupport;
