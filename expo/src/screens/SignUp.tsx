import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/client";

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignUp = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // proceed to profile setup
      navigation.replace('ProfileSetup');
    } catch (e:any) {
      Alert.alert('Sign up failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={onSignUp}><Text style={styles.buttonText}>Sign up</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('SignIn')}><Text style={styles.link}>Already have an account? Sign in</Text></TouchableOpacity>
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
