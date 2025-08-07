import { Navigate } from "react-router-dom";

// This component wraps protected routes
export function ProtectedRoute({ isAuth, children }: any) {
    if (!isAuth) {
        return <Navigate to="/" replace />;
    }
    return children;
}
