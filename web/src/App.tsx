import "./App.css";
import AppRouter from "./AppRouter";
import { Analytics } from "@vercel/analytics/react";

function App() {
    return (
        <div>
            <AppRouter />
            <Analytics />
        </div>
    );
}

export default App;
