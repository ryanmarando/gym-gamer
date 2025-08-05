import React from "react";
import {
    Modal,
    View,
    Image,
    FlatList,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import PixelText from "../components/PixelText";

const { width, height } = Dimensions.get("window");

export default function ImageViewerModal({
    visible,
    photos,
    initialIndex,
    onClose,
}: {
    visible: boolean;
    photos: { id: number; path: string; date: string }[];
    initialIndex: number;
    onClose: () => void;
}) {
    const flatListRef = React.useRef<FlatList>(null);

    React.useEffect(() => {
        if (
            visible &&
            flatListRef.current &&
            initialIndex >= 0 &&
            initialIndex < photos.length
        ) {
            flatListRef.current.scrollToIndex({
                index: initialIndex,
                animated: false,
            });
        }
    }, [visible, initialIndex, photos.length]);

    return (
        <Modal visible={visible} transparent={false}>
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={photos}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    onScrollToIndexFailed={(info) => {
                        console.warn("Scroll to index failed", info);
                        // scroll to nearest safe index
                        if (flatListRef.current) {
                            flatListRef.current.scrollToIndex({
                                index: Math.max(
                                    0,
                                    Math.min(
                                        info.highestMeasuredFrameIndex,
                                        photos.length - 1
                                    )
                                ),
                                animated: false,
                            });
                        }
                    }}
                    renderItem={({ item }) => (
                        <View style={styles.page}>
                            <Image
                                source={{ uri: item.path }}
                                style={styles.image}
                            />
                            <PixelText style={styles.date}>
                                {new Date(item.date).toLocaleDateString()}
                            </PixelText>
                        </View>
                    )}
                />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <PixelText style={styles.closeText}>Close</PixelText>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    page: {
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width * 0.9,
        height: height * 0.7,
        resizeMode: "contain",
        borderRadius: 12,
    },
    date: {
        color: "white",
        fontSize: 14,
        marginTop: 10,
    },
    closeButton: {
        position: "absolute",
        top: 70,
        right: 20,
        padding: 10,
    },
    closeText: {
        color: "red",
        fontSize: 18,
    },
});
