import AdminApp from "./admin/AdminApp";
import MainApp from "./main/MainApp";

function AppRouter() {
    const hostname = window.location.hostname;

    if (hostname.startsWith("admin.")) {
        return <AdminApp />;
    }

    return <MainApp />;
}

export default AppRouter;
