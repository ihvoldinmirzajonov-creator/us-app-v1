import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Image, Alert } from "react-native";
import { colors, typography, spacing } from "../styles/tokens";
import HeartPhoto from "../components/HeartPhoto";
import { auth, db, storage } from "../firebase/client";
import { doc, onSnapshot, getDoc, setDoc, collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const [couple, setCouple] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [revealable, setRevealable] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) return setLoading(false);
      // Load user doc to get coupleId
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      const coupleId = userData?.coupleId || null;
      if (coupleId) {
        const coupleRef = doc(db, 'couples', coupleId);
        const unsub = onSnapshot(coupleRef, (snap) => {
          if (snap.exists()) setCouple(snap.data());
          else setCouple(null);
          setLoading(false);
        });
        // cleanup when auth changes
        return () => unsub();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // fetch a daily question (simple: first with category 'daily')
    const loadDaily = async () => {
      try {
        const q = query(collection(db, 'questions'), where('category', '==', 'daily'));
        const snaps = await getDocs(q);
        if (!snaps.empty) setDailyQuestion(snaps.docs[0].data());
      } catch (e) {
        console.log('loadDaily err', e);
      }
    };
    loadDaily();
  }, []);

  useEffect(() => {
    if (!dailyQuestion || !couple) return;
    const statusRef = doc(db, 'questionsStatus', `${couple?.id || couple?._id}_${dailyQuestion?.id || dailyQuestion?._id || 'daily'}`);
    // listen for revealable
    const unsub = onSnapshot(statusRef, (snap) => {
      if (snap.exists()) setRevealable(snap.data()?.revealable === true);
      else setRevealable(false);
    });
    return () => unsub();
  }, [dailyQuestion, couple]);

  const pickAndUpload = async () => {
    if (!couple) return Alert.alert('No couple', 'You must be in a couple to upload a photo.');
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission required', 'Please allow photo access.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (result.cancelled) return;
      const uri = result.assets ? result.assets[0].uri : result.uri;
      setUploading(true);
      // fetch blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `couples/${couple?.id || couple?._id}/heart_${Date.now()}.jpg`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      // update couple photoUrl
      const coupleRef = doc(db, 'couples', couple?.id || couple?._id);
      await updateDoc(coupleRef, { photoUrl: url });
      setUploading(false);
    } catch (e:any) {
      setUploading(false);
      console.error('upload err', e);
      Alert.alert('Upload failed', e.message || String(e));
    }
  };

  const submitAnswer = async () => {
    if (!dailyQuestion) return;
    if (!auth.currentUser) return Alert.alert('Not signed in');
    if (!couple) return Alert.alert('No couple');
    try {
      setAnswerModalVisible(false);
      await addDoc(collection(db, 'answers'), {
        questionId: dailyQuestion.id || dailyQuestion._id || 'daily',
        coupleId: couple?.id || couple?._id,
        authorId: auth.currentUser.uid,
        text: answerText,
        createdAt: serverTimestamp()
      });
      setAnswerText('');
    } catch (e:any) {
      console.error('answer err', e);
      Alert.alert('Failed to submit', e.message || String(e));
    }
  };

  const registerForPush = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      // save token to user doc under expoPushTokens
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { expoPushTokens: Array.isArray((await getDoc(userRef)).data()?.expoPushTokens) ? [...(await getDoc(userRef)).data().expoPushTokens, token] : [token] });
      }
    } catch (e) {
      console.log('push register err', e);
    }
  };

  useEffect(()=>{
    // attempt to register for notifications on mount
    registerForPush();
  },[]);

  if (loading) return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.background}}><ActivityIndicator /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.names}>{couple?.partnerAName || 'You'}  ❤️  {couple?.partnerBName || 'Partner'}</Text>
        <Text style={styles.sub}>Together {couple?.startDate ? '(since ' + new Date(couple.startDate.seconds*1000).toLocaleDateString() + ')' : ''}</Text>
      </View>

      <View style={styles.hero}>
        <TouchableOpacity onPress={pickAndUpload} disabled={!couple}>
          {uploading ? <View style={{width:220,height:220,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View> : <HeartPhoto size={220} imageUri={couple?.photoUrl} />}
        </TouchableOpacity>
        <Text style={styles.countdown}>12 days</Text>
        <Text style={styles.countLabel}>until next meeting</Text>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Love Note</Text>
          <Text style={styles.cardBody}>You left a short note — tap to open.</Text>
          <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Open</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Question</Text>
          <Text style={styles.cardBody}>{dailyQuestion?.text || 'Loading question...'}</Text>
          {!revealable ? (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={()=>setAnswerModalVisible(true)}><Text style={[styles.buttonText, { color: "#fff" }]}>Answer</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#FFF', borderColor: colors.text, borderWidth:1 }]} onPress={()=>Alert.alert('Reveal','Both answered — reveal logic goes here')}><Text style={[styles.buttonText, { color: colors.text }]}>Reveal</Text></TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={answerModalVisible} animationType="slide" transparent>
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={{...typography.heading,fontSize:18,marginBottom:8}}>Answer</Text>
            <TextInput value={answerText} onChangeText={setAnswerText} placeholder="Write your answer..." multiline style={{height:120,backgroundColor:'#fff',padding:12,borderRadius:10}} />
            <View style={{flexDirection:'row',marginTop:12,justifyContent:'space-between'}}>
              <TouchableOpacity style={{padding:10}} onPress={()=>setAnswerModalVisible(false)}><Text style={{color:colors.text}}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={{backgroundColor:colors.accent,padding:10,borderRadius:8}} onPress={submitAnswer}><Text style={{color:'#fff'}}>Submit</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: "center", paddingVertical: spacing.md },
  names: { ...typography.heading, fontSize: 20, color: colors.text },
  sub: { ...typography.body, color: colors.text, opacity: 0.8 },
  hero: { alignItems: "center", marginTop: 8 },
  countdown: { ...typography.heading, fontSize: 34, marginTop: 10 },
  countLabel: { ...typography.body, opacity: 0.8 },
  cards: { padding: spacing.md, gap: 12 },
  card: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 16, shadowColor: colors.shadow, marginBottom:12 },
  cardTitle: { ...typography.heading, fontSize: 16 },
  cardBody: { ...typography.body, marginVertical: 8 },
  button: { marginTop: 8, backgroundColor: "transparent", borderRadius: 12, padding: 12, alignItems: "center" },
  buttonText: { ...typography.body, color: colors.text }
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalView: {
    width: '90%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16
  }
});
