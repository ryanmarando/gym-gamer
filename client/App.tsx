import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
    useFonts,
    PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import * as SplashScreen from "expo-splash-screen";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import BottomTabs from "./components/BottomTabs";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [fontsLoaded] = useFonts({
        PressStart2P_400Regular,
    });

    useEffect(() => {
        const prepare = async () => {
            if (fontsLoaded) {
                await SplashScreen.hideAsync();
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
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
}
