import React, { useEffect, useState } from "react";
import {
    View,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { openDatabaseSync } from "expo-sqlite";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ImageViewerModal from "../components/ImageViewerModal";
import PixelModal from "../components/PixelModal";
import { playPixelSound } from "../utils/playPixelSound";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playQuickAddSound } from "../utils/playQuickAddSound";

// Open database (sync API)
const db = openDatabaseSync("progressPhotos.db");

// Create table once
db.execSync(`
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT,
        date TEXT
    );
`);

export default function ProgressPhotos({ navigation }: any) {
    const [photos, setPhotos] = useState<
        { id: number; path: string; date: string }[]
    >([]);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => {},
    });

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = () => {
        try {
            db.runSync("DELETE FROM photos WHERE path IS NULL OR path = '';");
            const result = db.getAllSync("SELECT * FROM photos;");
            setPhotos(result as any); // result is already typed
        } catch (err) {
            console.error("Failed to load photos:", err);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 0.8,
        });
        setLoading(true);

        if (!result.canceled && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            const filename = imageUri.split("/").pop();
            const newPath = FileSystem.documentDirectory! + filename;

            try {
                await FileSystem.copyAsync({
                    from: imageUri,
                    to: newPath,
                });

                const now = new Date().toISOString();

                db.runSync("INSERT INTO photos (path, date) VALUES (?, ?);", [
                    newPath,
                    now,
                ]);
                playQuickAddSound();
                loadPhotos();
                setLoading(false);
            } catch (error) {
                console.error("Error saving image:", error);
            }
        } else {
            console.log("No image selected, skipping insert.");
        }
    };

    const deletePhoto = async (id: number, path: string) => {
        if (!FileSystem.documentDirectory) {
            throw new Error(
                "Document directory is not available on this platform"
            );
        }
        if (!path || !path.startsWith(FileSystem.documentDirectory)) {
            console.warn("Skipping delete — invalid path:", path);
            db.runSync("DELETE FROM photos WHERE id = ?;", [id]);
            loadPhotos();
            return;
        }
        try {
            await FileSystem.deleteAsync(path, { idempotent: true });
            db.runSync("DELETE FROM photos WHERE id = ?;", [id]);
            loadPhotos();
            playDeleteSound();
            setModalVisible(false);
        } catch (err) {
            console.error("Failed to delete photo:", err);
        }
    };

    const handledeletePhoto = async (id: number, path: string) => {
        playPixelSound();
        setModalConfig({
            title: "Are you sure, gamer!",
            message: "Are you sure you want to delete this photo?",
            onConfirm: () => deletePhoto(id, path),
        });
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1, padding: 16 }}>
                <PixelText style={styles.header}>Progress Photos</PixelText>

                <PixelButton text="Add Photo" onPress={pickImage} />

                {loading && (
                    <View style={styles.container}>
                        <ActivityIndicator size="large" color="#0ff" />
                    </View>
                )}

                <FlatList
                    data={photos}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ marginTop: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.imageContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    setCurrentIndex(
                                        photos.findIndex(
                                            (p) => p.id === item.id
                                        )
                                    );
                                    setViewerVisible(true);
                                    playPixelSound();
                                }}
                            >
                                <Image
                                    source={{ uri: item.path }}
                                    style={styles.image}
                                />
                            </TouchableOpacity>
                            <PixelText style={styles.dateText}>
                                {new Date(item.date).toLocaleDateString()}
                            </PixelText>
                            <TouchableOpacity
                                onPress={() => {
                                    handledeletePhoto(item.id, item.path);
                                }}
                            >
                                <PixelText style={styles.deleteText}>
                                    Delete
                                </PixelText>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <View style={styles.bottomButtonContainer}>
                    <PixelButton
                        text="Back to Profile"
                        color="rgba(200, 0, 255, 1)"
                        onPress={() => navigation.goBack()}
                        containerStyle={{ paddingHorizontal: 20 }}
                    />
                </View>

                <PixelModal
                    visible={modalVisible}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalVisible(false)}
                />
            </View>
            {viewerVisible && (
                <ImageViewerModal
                    visible={viewerVisible}
                    photos={photos}
                    initialIndex={currentIndex}
                    onClose={() => {
                        setViewerVisible(false);
                        playPixelSound();
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: "5%",
        width: "100%",
    },
    header: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 12,
    },
    imageContainer: {
        margin: 10,
        alignItems: "center",
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
    },
    dateText: {
        marginTop: 5,
        fontSize: 12,
        color: "gray",
    },
    deleteText: {
        color: "red",
        marginTop: 2,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    fullImageContainer: {
        width: 300,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    fullImage: {
        width: 300,
        height: 300,
    },
    dateOverlay: {
        color: "white",
        position: "absolute",
        bottom: 20,
        fontSize: 14,
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 8,
    },
    bottomButtonContainer: {
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
});
