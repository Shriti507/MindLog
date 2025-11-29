import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { JournalContext } from "../context/JournalContext";

const MOODS = [
  { name: "rad", label: "rad", color: "#00E676", icon: "😄" },
  { name: "good", label: "good", color: "#AEEA00", icon: "🙂" },
  { name: "meh", label: "meh", color: "#64B5F6", icon: "😐" },
  { name: "bad", label: "bad", color: "#FF8C00", icon: "☹️" },
  { name: "awful", label: "awful", color: "#FF1744", icon: "😫" },
];

export default function JournalEntryScreen({ navigation }) {
  const { addEntry } = useContext(JournalContext);
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [sleep, setSleep] = useState("");
  const [social, setSocial] = useState("");

  const handleSave = async () => {
    if (!selectedMood) {
      alert("Please select a mood!");
      return;
    }

    const newEntry = {
      text,
      mood: selectedMood.name,
      sleep: sleep || null,
      social: social || null,
      date: new Date().toISOString(),
    };

    await addEntry(newEntry);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Entry</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mood Selection */}
        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.name}
              style={[
                styles.moodItem,
                selectedMood?.name === m.name && styles.selectedMood,
              ]}
              onPress={() => setSelectedMood(m)}
            >
              <Text style={styles.moodIcon}>{m.icon}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  { color: selectedMood?.name === m.name ? "#000" : "#ddd" },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text Input */}
        <Text style={styles.label}>What's on your mind?</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your thoughts here..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
        />

        {/* Optional Tags */}
        <Text style={styles.label}>Tags (Optional)</Text>
        <View style={styles.tagRow}>
          <TextInput
            style={styles.tagInput}
            placeholder="Sleep (e.g. 8h)"
            placeholderTextColor="#666"
            value={sleep}
            onChangeText={setSleep}
          />
          <TextInput
            style={styles.tagInput}
            placeholder="Social (e.g. Family)"
            placeholderTextColor="#666"
            value={social}
            onChangeText={setSocial}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  saveBtn: { color: "#2FE0C2", fontSize: 18, fontWeight: "600" },
  content: { paddingHorizontal: 20 },
  label: { color: "#aaa", fontSize: 16, marginTop: 20, marginBottom: 10 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodItem: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#1F1F1F",
    width: 60,
  },
  selectedMood: { backgroundColor: "#2FE0C2" },
  moodIcon: { fontSize: 24 },
  moodLabel: { fontSize: 12, marginTop: 4 },
  input: {
    backgroundColor: "#1F1F1F",
    color: "white",
    borderRadius: 12,
    padding: 15,
    height: 150,
    textAlignVertical: "top",
    fontSize: 16,
  },
  tagRow: { flexDirection: "row", gap: 10 },
  tagInput: {
    flex: 1,
    backgroundColor: "#1F1F1F",
    color: "white",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
});