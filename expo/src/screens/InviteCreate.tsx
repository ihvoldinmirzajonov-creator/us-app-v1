import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { sendInvite } from "../firebase/functions";
import { auth } from "../firebase/client";

export default function InviteCreateScreen({ navigation }: any) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteId, setInviteId] = useState<string | null>(null);

  const onCreate = async () => {
    try {
      const res = await sendInvite(inviteEmail);
      setInviteId(res.inviteId);
    } catch (e:any) {
      Alert.alert('Invite failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite your partner</Text>
      {!inviteId ? (
        <>
          <TextInput placeholder="Partner email" value={inviteEmail} onChangeText={setInviteEmail} style={styles.input} keyboardType="email-address" />
          <TouchableOpacity style={styles.button} onPress={onCreate}><Text style={styles.buttonText}>Send invite</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{textAlign:'center',marginBottom:12}}>Share this invite code with your partner:</Text>
          <Text style={{textAlign:'center',fontWeight:'600'}}>{inviteId}</Text>
        </>
      )}
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
