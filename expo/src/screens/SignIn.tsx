import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/client";

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e:any) {
      Alert.alert('Sign in failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={onSignIn}><Text style={styles.buttonText}>Sign in</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('SignUp')}><Text style={styles.link}>Don't have an account? Sign up</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20,backgroundColor:'#F6EFE6'},
  title:{fontSize:22,fontFamily:'serif',color:'#3B2E2C',marginBottom:12,textAlign:'center'},
  input:{backgroundColor:'#fff',padding:12,borderRadius:10,marginBottom:12},
  button:{backgroundColor:'#E07A5F',padding:12,borderRadius:10,alignItems:'center'},
  buttonText:{color:'#fff'},
  link:{color:'#3B2E2C',marginTop:12,textAlign:'center'}
});
