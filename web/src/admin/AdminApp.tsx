import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoutes";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";

function AdminApp() {
    const [token, setToken] = useState<string>("");
    const [name, setName] = useState<string>("");

    return (
        <Router basename="/">
            <Routes>
                <Route
                    path="/"
                    element={
                        <LoginPage setToken={setToken} setName={setName} />
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute isAuth={!!token}>
                            <DashboardPage token={token} name={name} />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default AdminApp;
