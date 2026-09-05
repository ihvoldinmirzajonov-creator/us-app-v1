import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { colors, typography, spacing } from "../styles/tokens";
import HeartPhoto from "../components/HeartPhoto";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

export default function HomeScreen() {
  const [couple, setCouple] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();
    const coupleId = "couple_demo"; // TODO: replace with actual
    const unsub = onSnapshot(doc(db, "couples", coupleId), (snap) => {
      if (snap.exists()) setCouple(snap.data());
    });
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.names}>Ava  ❤️  Ben</Text>
        <Text style={styles.sub}>Together 2y 3m</Text>
      </View>

      <View style={styles.hero}>
        <HeartPhoto size={220} imageUri={couple?.photoUrl} />
        <Text style={styles.countdown}>12 days</Text>
        <Text style={styles.countLabel}>until next meeting</Text>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Love Note</Text>
          <Text style={styles.cardBody}>You left a short note for Ben — tap to open.</Text>
          <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Open</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Question</Text>
          <Text style={styles.cardBody}>What made you smile today?</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]}><Text style={[styles.buttonText, { color: "#fff" }]}>Answer</Text></TouchableOpacity>
        </View>
      </View>
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
  card: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 16, shadowColor: colors.shadow },
  cardTitle: { ...typography.heading, fontSize: 16 },
  cardBody: { ...typography.body, marginVertical: 8 },
  button: { marginTop: 8, backgroundColor: "transparent", borderRadius: 12, padding: 12, alignItems: "center" },
  buttonText: { ...typography.body, color: colors.text }
});
