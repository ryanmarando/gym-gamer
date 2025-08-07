import AppIcon from "../assets/photos/gym-gamer-app-icon.png";
import { authFetch } from "../utils/authFetch";

type DashboardPageProps = {
    token: string;
    name: string;
};

export default function DashboardPage({ token, name }: DashboardPageProps) {
    const getAllUsers = async () => {
        const res = await authFetch(
            `/user/getAllUsers`,
            { method: "GET" },
            token
        );
        console.log(res);
    };
    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    fontSize: "2rem",
                    fontFamily: "sans-serif",
                }}
            >
                Gym Gamer Admin Dashboard
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <h2>Hi, {name}</h2>
                <img src={AppIcon} height={75} alt="Description" />
                <button onClick={getAllUsers}>Get All Users</button>
            </div>
        </>
    );
}
