import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./src/navigation/TabNavigator";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./src/firebase/config";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();

initializeApp(firebaseConfig);

export default function App() {
  useEffect(() => {
    // load fonts here (Playfair + Inter) via expo-font if integrated
  }, []);

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
