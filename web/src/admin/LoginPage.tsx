import { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
    setToken: (token: string) => void;
    setName: (name: string) => void;
};

function LoginPage({ setToken, setName }: LoginPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.user.isAdmin) {
                throw new Error(data.message || "Login failed");
            }

            setSuccess("Login successful!");
            setToken(data.token);
            setName(data.user.name);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "sans-serif",
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "300px",
                    padding: "2rem",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center" }}>Admin Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "10px", fontSize: "1rem" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: "10px", fontSize: "1rem" }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px",
                        backgroundColor: "#333",
                        color: "#fff",
                        fontSize: "1rem",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {error && <div style={{ color: "red" }}>{error}</div>}
                {success && <div style={{ color: "green" }}>{success}</div>}
            </form>
        </div>
    );
}

export default LoginPage;
