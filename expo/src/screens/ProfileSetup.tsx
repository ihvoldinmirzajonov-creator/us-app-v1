import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { auth, db } from "../firebase/client";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function ProfileSetupScreen({ navigation }: any) {
  const [name, setName] = useState("");

  const onSave = async () => {
    try {
      if (!auth.currentUser) throw new Error('Not signed in');
      await updateProfile(auth.currentUser, { displayName: name });
      // create user doc
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name,
        email: auth.currentUser.email,
        photoUrl: null,
        coupleId: null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: serverTimestamp()
      });
      navigation.replace('SignIn');
    } catch (e:any) {
      Alert.alert('Save failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about you</Text>
      <TextInput placeholder="Your name" value={name} onChangeText={setName} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={onSave}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('JoinInvite')}><Text style={styles.link}>I have an invite code</Text></TouchableOpacity>
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
