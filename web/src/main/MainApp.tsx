import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import SubscriptionCancel from "./SubscriptionCancel";
import SubscriptionSuccess from "./SubscriptionSuccess";
import PrivacyPolicy from "./PrivacyPolicy";
import ContactSupport from "./ContactSupport";

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
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<ContactSupport />} />
            </Routes>
        </Router>
    );
}

export default MainApp;
