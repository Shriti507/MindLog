import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import uuid from "react-native-uuid";
import { JournalContext } from "../context/JournalContext";

export default function JournalEntryScreen({ navigation }) {
  const { addEntry } = useContext(JournalContext);
  const [text, setText] = useState("");

  const save = () => {
    const entry = {
      id: uuid.v4(),
      date: new Date().toISOString(),
      mood: null,
      text: text.trim(),
    };
    addEntry(entry);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="#333"/></TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={{color:'white',fontWeight:'700'}}>Save</Text></TouchableOpacity>
      </View>

      <View style={styles.dateBox}>
        <Text style={styles.bigDate}>{dayjs().format("DD")}</Text>
        <View>
          <Text style={styles.small}>{dayjs().format("ddd")}</Text>
          <Text style={styles.small}>{dayjs().format("YYYY.MM")}</Text>
        </View>
      </View>

      <ScrollView style={{flex:1}}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Start writing..."
          placeholderTextColor="#999"
          multiline
          style={styles.input}
        />
      </ScrollView>

      <View style={styles.bottomToolbar}>
        <Ionicons name="text-outline" size={22} color="#333" />
        <Ionicons name="image-outline" size={22} color="#333" />
        <Ionicons name="mic-outline" size={22} color="#333" />
        <Ionicons name="time-outline" size={22} color="#333" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F6F7ED',paddingTop:38},
  header:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:18,marginBottom:8},
  saveBtn:{backgroundColor:'#82E0AA',paddingVertical:8,paddingHorizontal:16,borderRadius:10},
  dateBox:{flexDirection:'row',alignItems:'center',paddingHorizontal:18,marginBottom:10},
  bigDate:{fontSize:48,fontWeight:'700',marginRight:12},
  small:{color:'#555'},
  input:{paddingHorizontal:18,fontSize:18,minHeight:260,color:'#000'},
  bottomToolbar:{height:60,flexDirection:'row',justifyContent:'space-around',alignItems:'center',backgroundColor:'#EEF0E6'}
});
