import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";

function MainApp() {
    return (
        <Router basename="/">
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </Router>
    );
}

export default MainApp;
