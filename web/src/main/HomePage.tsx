import { useState, useRef } from "react";
import AppIcon from "../assets/photos/gym-gamer-app-icon.png";
import BarbellPixel from "../assets/photos/DumbbellPixel.png";
import ControllerPixel from "../assets/photos/ControllerPixel.png";
import HeadphonePixel from "../assets/photos/HeadphonePixel.png";
import AnimationPixel from "../assets/photos/PixelConfettiAnimation.gif";
import submitSoundFile from "../assets/sounds/sword_selection_sound.wav";
import backgroundMusic from "../assets/sounds/pixel_adventure_music.wav";
import "./HomePage.css";

function HomePage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [musicStarted, setMusicStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const PixelConfetti = ({ count = 150 }) => {
        const colors = [
            "#ff0055",
            "#00ffff",
            "#ffff00",
            "#00ff00",
            "#ff8800",
            "#ffffff",
        ];
        const pixels = Array.from({ length: count }, (_, i) => ({
            id: i,
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            size: Math.floor(Math.random() * 6) + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                }}
            >
                {pixels.map((pixel) => (
                    <div
                        key={pixel.id}
                        style={{
                            position: "absolute",
                            top: pixel.top,
                            left: pixel.left,
                            width: pixel.size,
                            height: pixel.size,
                            backgroundColor: pixel.color,
                            imageRendering: "pixelated",
                        }}
                    />
                ))}
            </div>
        );
    };

    const startMusic = () => {
        if (!musicStarted) {
            audioRef.current = new Audio(backgroundMusic);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(console.error);
            setMusicStarted(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            const audio = new Audio(submitSoundFile);
            audio.volume = 0.5;
            audio.play();

            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/auth/createSqueezeUser`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, name }),
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message);
                }

                setSubmitted(true);
            } catch (err: any) {
                console.log(err);
            }
        }
    };

    return (
        <div onClick={startMusic} onScroll={startMusic}>
            <PixelConfetti />
            <div style={styles.container}>
                <img
                    src={AppIcon}
                    height={80}
                    alt="Gym Gamer Icon"
                    style={{ marginBottom: 20, zIndex: 10 }}
                />
                <div style={{ flexDirection: "row", display: "flex" }}>
                    <img
                        src={BarbellPixel}
                        height={45}
                        alt="Barbell Icon"
                        style={{ marginBottom: 20 }}
                    />
                    <h1 style={styles.title}>Gym Gamer</h1>
                    <img
                        src={ControllerPixel}
                        height={45}
                        alt="Controller Icon"
                        style={{ marginBottom: 20 }}
                    />
                </div>
                <div
                    style={{
                        borderWidth: 2,
                        borderColor: "white",
                        borderStyle: "solid",
                        borderRadius: 10,
                        padding: 6,
                        zIndex: 8,
                        backgroundColor: "#1b1b1b",
                    }}
                >
                    <p style={styles.subtitle}>
                        Transform yourself from gamer to gym gamer for{" "}
                        <strong>FREE</strong> with this easy workout schedule
                        and tips to stay on track. Emailed right to you!
                    </p>
                </div>

                {submitted ? (
                    <div>
                        <p style={styles.success}>
                            🎉 Thanks, {name.split(" ")[0]}! You're on the list.
                        </p>
                        <img
                            src={AnimationPixel}
                            alt="Success Celebration"
                            style={{
                                width: 700,
                                position: "fixed",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 9999,
                                pointerEvents: "none",
                            }}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <img
                                src={HeadphonePixel}
                                alt="Pixel Headphones"
                                style={{
                                    position: "absolute",
                                    top: -20,
                                    right: -12,
                                    width: 60,
                                    transform: "rotate(15deg)",
                                    pointerEvents: "none",
                                    zIndex: 2,
                                }}
                            />
                        </div>

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />

                        <button type="submit" style={buttonStyle}>
                            💌 Ready Player One!
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: "100vh",
        backgroundColor: "#1b1b1b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Press Start 2P', cursive",
        textAlign: "center",
        paddingTop: "20%",
        zIndex: 9,
    },
    title: {
        fontSize: "1.25rem",
        marginBottom: "0.5rem",
        marginLeft: 15,
        marginRight: 15,
    },
    subtitle: {
        fontSize: "0.75rem",
        marginBottom: "1.5rem",
        color: "#00ffcc",
        lineHeight: 2,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        maxWidth: "300px",
        marginTop: 20,
        zIndex: 9,
    },
    success: {
        fontSize: "0.75rem",
        color: "#0f0",
    },
};

const inputStyle: React.CSSProperties = {
    padding: "10px",
    border: "2px solid #00ffcc",
    backgroundColor: "#000",
    color: "#00ffcc",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "0.7rem",
    outline: "none",
    textAlign: "center" as const,
};

const buttonStyle: React.CSSProperties = {
    padding: "10px",
    border: "2px solid #fff",
    backgroundColor: "#0011ffff",
    color: "#fff",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "0.7rem",
    cursor: "pointer",
    textAlign: "center" as const,
};

export default HomePage;
