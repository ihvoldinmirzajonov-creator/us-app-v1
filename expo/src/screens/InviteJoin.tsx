import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createCouple } from "../firebase/functions";

export default function InviteJoinScreen({ navigation }: any) {
  const [code, setCode] = useState("");

  const onJoin = async () => {
    try {
      const res = await createCouple(code);
      Alert.alert('Success', 'Couple created');
      navigation.replace('SignIn');
    } catch (e:any) {
      Alert.alert('Join failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join with invite code</Text>
      <TextInput placeholder="Invite code" value={code} onChangeText={setCode} style={styles.input} autoCapitalize='none' />
      <TouchableOpacity style={styles.button} onPress={onJoin}><Text style={styles.buttonText}>Join</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20,backgroundColor:'#F6EFE6'},
  title:{fontSize:20,fontFamily:'serif',color:'#3B2E2C',marginBottom:12,textAlign:'center'},
  input:{backgroundColor:'#fff',padding:12,borderRadius:10,marginBottom:12},
  button:{backgroundColor:'#E07A5F',padding:12,borderRadius:10,alignItems:'center'},
  buttonText:{color:'#fff'}
});
