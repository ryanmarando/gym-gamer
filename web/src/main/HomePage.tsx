import AppIcon from "../assets/photos/gym-gamer-app-icon.png";

function HomePage() {
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
            Gym Gamer Coming Soon!
            <img src={AppIcon} height={75} alt="Description" />
        </div>
    );
}

export default HomePage;
