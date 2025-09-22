import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
    useFonts,
    PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import * as SplashScreen from "expo-splash-screen";
import { handleWeeklyReset } from "./utils/handleWeeklyReset";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import BottomTabs from "./components/BottomTabs";
import UpdateWeightScreen from "./screens/UpdateWeightScreen";
import UserWaiverScreen from "./screens/UserWaiverScreen";
import ProgressPhotos from "./screens/ProgressPhotos";
import CreditsScreen from "./screens/CreditsScreen";
import TrackLiftsScreen from "./screens/TrackLiftsScreen";
import { openDb } from "./db/db";
import { Text } from "react-native";

const RootStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const didRun = useRef(false);

    const [fontsLoaded] = useFonts({
        PressStart2P_400Regular,
    });

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        const prepare = async () => {
            if (fontsLoaded) {
                await SplashScreen.hideAsync();
            }

            try {
                await openDb();
                await handleWeeklyReset();
            } catch (err) {
                console.error("Weekly reset failed:", err);
            }
        };

        prepare();
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <NavigationContainer>
            {isLoggedIn ? (
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    <RootStack.Screen name="MainTabs">
                        {(props) => (
                            <BottomTabs
                                {...props}
                                isLoggedIn={isLoggedIn}
                                setIsLoggedIn={setIsLoggedIn}
                            />
                        )}
                    </RootStack.Screen>
                    <Stack.Screen
                        name="UpdateWeight"
                        component={UpdateWeightScreen}
                        options={{ title: "Update Bodyweight" }}
                    />
                    <Stack.Screen
                        name="ProgressPhotos"
                        component={ProgressPhotos}
                    />
                    <Stack.Screen
                        name="CreditsScreen"
                        component={CreditsScreen}
                    />
                    <Stack.Screen
                        name="TrackLifts"
                        component={TrackLiftsScreen}
                    />
                </RootStack.Navigator>
            ) : (
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Login">
                        {(props) => (
                            <LoginScreen
                                {...props}
                                setIsLoggedIn={setIsLoggedIn}
                            />
                        )}
                    </AuthStack.Screen>
                    <AuthStack.Screen name="Register">
                        {(props) => (
                            <RegisterScreen
                                {...props}
                                setIsLoggedIn={setIsLoggedIn}
                            />
                        )}
                    </AuthStack.Screen>
                    <AuthStack.Screen
                        name="UserWaiver"
                        component={UserWaiverScreen}
                    />
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
}
