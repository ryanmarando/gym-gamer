import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import SubscriptionCancel from "./SubscriptionCancel";
import SubscriptionSuccess from "./SubscriptionSuccess";

function MainApp() {
    return (
        <Router basename="/">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/subscription-success"
                    element={<SubscriptionSuccess />}
                />
                <Route
                    path="/subscription-cancel"
                    element={<SubscriptionCancel />}
                />
            </Routes>
        </Router>
    );
}

export default MainApp;
