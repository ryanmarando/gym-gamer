import { useState } from "react";
import AppIcon from "../assets/photos/gym-gamer-app-icon.png";
import { authFetch } from "../utils/authFetch";

type DashboardPageProps = {
    token: string;
    name: string;
};

export default function DashboardPage({ token, name }: DashboardPageProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [squeezeUsers, setSqueezeUsers] = useState<any[]>([]);

    const getAllUsers = async () => {
        const res = await authFetch(
            `/user/getAllUsers`,
            { method: "GET" },
            token
        );
        if (res && Array.isArray(res)) {
            setUsers(res);
        }
    };

    const getAllSqueezeUsers = async () => {
        const res = await authFetch(
            `/user/getAllSqueezeUsers`,
            { method: "GET" },
            token
        );
        if (res && Array.isArray(res)) {
            setSqueezeUsers(res);
        }
    };

    const deleteSqueezeUser = async (email: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this squeeze user?"
        );
        if (!confirmed) return;
        try {
            await authFetch(
                `/auth/deleteSqueezeUserByEmail/${email}`,
                { method: "DELETE" },
                token
            );

            setSqueezeUsers((prev) =>
                prev.filter((user) => user.email !== email)
            );
        } catch (error) {
            alert("Failed to delete squeeze user." + error);
        }
    };

    const renderUserList = (users: any[]) =>
        users.map((user, index) => (
            <li key={index}>
                <strong>{user.name}</strong> ({user.email}) — Level {user.level}
                , XP: {user.xp}, Total Lifted: {user.totalWeightLifted}{" "}
                {user.weightSystem}
            </li>
        ));

    const renderSqueezeUserList = (users: any[]) =>
        users.map((user, index) => (
            <li
                key={index}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                <span>
                    <strong>{user.name}</strong> ({user.email})
                </span>
                <button
                    onClick={() => deleteSqueezeUser(user.email)}
                    style={{
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Delete
                </button>
            </li>
        ));

    return (
        <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", textAlign: "center" }}>
                Gym Gamer Admin Dashboard
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <h2>Hi, {name}</h2>
                <img src={AppIcon} height={75} alt="Gym Gamer Icon" />
                <button onClick={getAllUsers} style={{ marginTop: "1rem" }}>
                    Get All Users
                </button>
                <button
                    onClick={getAllSqueezeUsers}
                    style={{ marginTop: "0.5rem" }}
                >
                    Get All Squeeze Users
                </button>

                {users.length > 0 && (
                    <div
                        style={{
                            marginTop: "2rem",
                            textAlign: "left",
                            width: "100%",
                            maxWidth: 600,
                        }}
                    >
                        <h3>All Users:</h3>
                        <ul
                            style={{
                                paddingLeft: "1.5rem",
                                listStyleType: "disc",
                            }}
                        >
                            {renderUserList(users)}
                        </ul>
                    </div>
                )}

                {squeezeUsers.length > 0 && (
                    <div
                        style={{
                            marginTop: "2rem",
                            textAlign: "left",
                            width: "100%",
                            maxWidth: 600,
                        }}
                    >
                        <h3>All Squeeze Users:</h3>
                        <ul
                            style={{
                                paddingLeft: "1.5rem",
                                listStyleType: "disc",
                            }}
                        >
                            {renderSqueezeUserList(squeezeUsers)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
