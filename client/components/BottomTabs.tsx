import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
                tabBarItemStyle: {
                    flex: 1, // spread items evenly
                },
                tabBarActiveTintColor: "#0ff",
                tabBarInactiveTintColor: "#888",
                tabBarIcon: ({ color, size }) => {
                    let iconName: string;
                    if (route.name === "Profile") iconName = "person";
                    else if (route.name === "Workouts") iconName = "barbell";
                    else if (route.name === "Achievements") iconName = "trophy";
                    else if (route.name === "Leaderboards") iconName = "podium";
                    else iconName = "ellipse";

                    return (
                        <Ionicons
                            name={iconName as any}
                            size={size}
                            color={color}
                        />
                    );
                },
                tabBarLabel: ({ color }) => (
                    <PixelText
                        fontSize={8}
                        color={color}
                        numberOfLines={1}
                        style={{
                            textAlign: "center",
                            paddingHorizontal: 4,
                            width: 1000,
                        }}
                    >
                        {route.name}
                    </PixelText>
                ),
            })}
        >
            <Tab.Screen name="Profile">
                {(props) => (
                    <ProfileScreen
                        {...props}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                )}
            </Tab.Screen>
            <Tab.Screen name="Workouts" component={WorkoutsScreen} />
            <Tab.Screen name="Achievements" component={AchievementsScreen} />
            <Tab.Screen name="Leaderboards" component={LeaderboardsScreen} />
        </Tab.Navigator>
    );
}
