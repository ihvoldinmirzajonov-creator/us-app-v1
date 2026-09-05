import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import TogetherScreen from "../screens/TogetherScreen";
import GamesScreen from "../screens/GamesScreen";
import MemoriesScreen from "../screens/MemoriesScreen";
import UsScreen from "../screens/UsScreen";
import { colors } from "../styles/tokens";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background, borderTopWidth: 0 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Together" component={TogetherScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Memories" component={MemoriesScreen} />
      <Tab.Screen name="Us" component={UsScreen} />
    </Tab.Navigator>
  );
}
