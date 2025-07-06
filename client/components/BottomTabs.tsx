import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PixelText from "./PixelText";

import ProfileScreen from "../screens/ProfileScreen";
import WorkoutsScreen from "../screens/WorkoutsScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import LeaderboardsScreen from "../screens/LeaderboardsScreen";

const Tab = createBottomTabNavigator();

type BottomTabsProps = {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BottomTabs({
    isLoggedIn,
    setIsLoggedIn,
}: BottomTabsProps) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#000",
                    borderTopColor: "#0ff",
                    height: 70,
                },
                tabBarActiveTintColor: "#0ff",
                tabBarInactiveTintColor: "#888",
                tabBarLabel: () => null,
                tabBarIcon: ({ color, size }) => {
                    let iconName:
                        | "person"
                        | "barbell"
                        | "trophy"
                        | "podium"
                        | "ellipse";
                    if (route.name === "Profile") iconName = "person";
                    else if (route.name === "Workouts") iconName = "barbell";
                    else if (route.name === "Achievements") iconName = "trophy";
                    else if (route.name === "Leaderboards") iconName = "podium";
                    else iconName = "ellipse";

                    return (
                        <View style={{ alignItems: "center" }}>
                            <Ionicons
                                name={iconName}
                                size={size}
                                color={color}
                            />

                            <PixelText
                                fontSize={8}
                                color={color}
                                numberOfLines={1}
                                style={{
                                    marginTop: 2,
                                    textAlign: "left",
                                    width: "100%",
                                }}
                            >
                                {route.name}
                            </PixelText>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="Profile"
                options={{
                    tabBarItemStyle: {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        // Profile stays centered
                    },
                }}
            >
                {(props) => (
                    <ProfileScreen
                        {...props}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                )}
            </Tab.Screen>
            <Tab.Screen
                name="Workouts"
                options={{
                    tabBarItemStyle: {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        transform: [{ translateX: -16 }], // 👈 shift left
                    },
                }}
                component={WorkoutsScreen}
            />
            <Tab.Screen
                name="Achievements"
                options={{
                    tabBarItemStyle: {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        transform: [{ translateX: -15 }], // 👈 shift left
                    },
                }}
                component={AchievementsScreen}
            />
            <Tab.Screen
                name="Leaderboards"
                options={{
                    tabBarItemStyle: {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        transform: [{ translateX: -5 }], // 👈 shift left
                    },
                }}
                component={LeaderboardsScreen}
            />
        </Tab.Navigator>
    );
}
