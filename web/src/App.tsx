import "./App.css";

function App() {
    const hostname = window.location.hostname;

    if (hostname.startsWith("admin.")) {
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "2rem",
                    fontFamily: "sans-serif",
                }}
            >
                Admin Panel Coming Soon!
            </div>
        );
    }

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "2rem",
                fontFamily: "sans-serif",
            }}
        >
            Main Site Coming Soon!
        </div>
    );
}

export default App;
