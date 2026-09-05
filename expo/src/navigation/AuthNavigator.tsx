import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignIn";
import SignUpScreen from "../screens/SignUp";
import ProfileSetupScreen from "../screens/ProfileSetup";
import InviteJoinScreen from "../screens/InviteJoin";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="JoinInvite" component={InviteJoinScreen} />
    </Stack.Navigator>
  );
}
