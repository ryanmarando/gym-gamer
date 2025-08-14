import React from "react";

const PrivacyPolicy: React.FC = () => {
    const textStyle: React.CSSProperties = {
        marginBottom: "20px",
        lineHeight: 1.8,
    };

    const listStyle: React.CSSProperties = {
        paddingLeft: "20px",
        marginBottom: "20px",
        lineHeight: 1.8,
    };

    const linkStyle: React.CSSProperties = {
        color: "#ff00ff",
        textDecoration: "underline",
    };

    const headingStyle: React.CSSProperties = {
        fontSize: "1rem",
        marginTop: "30px",
        marginBottom: "15px",
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
                    maxWidth: "800px",
                    backgroundColor: "#000",
                    border: "3px solid #00ffcc",
                    borderRadius: "10px",
                    padding: "30px",
                    textAlign: "left",
                }}
            >
                <h1
                    style={{
                        fontSize: "1.75rem",
                        marginBottom: "30px",
                        color: "#fff",
                    }}
                >
                    Privacy Policy – Gym Gamer
                </h1>

                <p style={{ ...textStyle, marginBottom: "30px" }}>
                    Effective Date: August 2025
                </p>

                <p style={textStyle}>
                    Gym Gamer (“we”, “our”, or “us”) respects your privacy and
                    is committed to protecting the personal information you
                    share with us. This Privacy Policy explains how we collect,
                    use, and safeguard your information when you use the Gym
                    Gamer app and related services.
                </p>

                <h2 style={headingStyle}>1. Information We Collect</h2>
                <p style={textStyle}>
                    When you use Gym Gamer, we may collect the following
                    information:
                </p>
                <ul style={listStyle}>
                    <li>
                        <strong>Account Information:</strong> Email, name, and
                        password. User's progress photos are only stored on
                        their local devices.
                    </li>
                    <li>
                        <strong>Subscription Data:</strong> Your subscription
                        status, purchase history, and payment confirmation
                        (processed securely through Apple’s or Android's in-app
                        purchase system).
                    </li>
                    <li>
                        <strong>Usage Data:</strong> Workout progress,
                        achievements, and interactions within the app.
                    </li>
                    <li>
                        <strong>Device Information:</strong> Device type,
                        operating system, and app version for performance
                        monitoring and bug fixes.
                    </li>
                </ul>

                <p style={textStyle}>
                    We do not store your payment information; all transactions
                    are securely handled by Apple and Android.
                </p>

                <h2 style={headingStyle}>2. How We Use Your Information</h2>
                <ul style={listStyle}>
                    <li>
                        Provide and maintain the app’s features, including
                        tracking workouts and managing subscriptions.
                    </li>
                    <li>
                        Send important notifications related to your account or
                        subscription.
                    </li>
                    <li>
                        Improve our app experience, fix bugs, and analyze usage
                        trends.
                    </li>
                    <li>Comply with legal obligations.</li>
                </ul>

                <h2 style={headingStyle}>3. Sharing Your Information</h2>
                <p style={textStyle}>
                    We do not sell, rent, or trade your personal information. We
                    may share your data in limited situations:
                </p>
                <ul style={listStyle}>
                    <li>
                        <strong>Service Providers:</strong> Third-party services
                        that help operate the app (e.g., cloud storage,
                        analytics).
                    </li>
                    <li>
                        <strong>Legal Compliance:</strong> When required by law
                        or to protect our rights.
                    </li>
                </ul>

                <h2 style={headingStyle}>4. Your Choices</h2>
                <ul style={listStyle}>
                    <li>
                        <strong>Manage Subscriptions:</strong> Cancel or modify
                        subscriptions directly through your Apple account.
                    </li>
                    <li>
                        <strong>Request Deletion:</strong> Contact us at{" "}
                        <a href="mailto:support@gymgamer.fit" style={linkStyle}>
                            support@gymgamer.fit
                        </a>{" "}
                        to request deletion of your personal data.
                    </li>
                </ul>

                <h2 style={headingStyle}>5. Security</h2>
                <p style={textStyle}>
                    We implement reasonable measures to protect your personal
                    information. However, no method of electronic storage or
                    transmission is completely secure, and we cannot guarantee
                    absolute security.
                </p>

                <h2 style={headingStyle}>6. Children’s Privacy</h2>
                <p style={textStyle}>
                    Gym Gamer is not intended for children under 13. We do not
                    knowingly collect personal information from children.
                </p>

                <h2 style={headingStyle}>7. Changes to This Policy</h2>
                <p style={textStyle}>
                    We may update this Privacy Policy from time to time. We
                    encourage you to review it periodically. Your continued use
                    of the app constitutes acceptance of any changes.
                </p>

                <h2 style={headingStyle}>8. Contact Us</h2>
                <ul style={{ ...listStyle, marginBottom: 0 }}>
                    <li>
                        Email:{" "}
                        <a href="mailto:support@gymgamer.fit" style={linkStyle}>
                            support@gymgamer.fit
                        </a>
                    </li>
                    <li>
                        Website:{" "}
                        <a href="https://gymgamer.fit" style={linkStyle}>
                            https://gymgamer.fit
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
