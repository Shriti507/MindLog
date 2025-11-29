import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { JournalContext } from "../context/JournalContext";
import uuid from "react-native-uuid";


const sleepOptions = [
  { label: "good sleep", icon: "bed" },
  { label: "medium sleep", icon: "bed-outline" },
  { label: "bad sleep", icon: "bed-sharp" },
  { label: "sleep early", icon: "time-outline" },
];

const socialOptions = [
  { label: "family", icon: "people-outline" },
  { label: "friends", icon: "person-outline" },
  { label: "party", icon: "musical-notes-outline" },
];

export default function MoodDetailScreen({ route, navigation }) {
  const { mood } = route.params || { name: "unknown", icon: "😐" };
  const { addEntry } = useContext(JournalContext);

  const [selectedSleep, setSelectedSleep] = useState(null);
  const [selectedSocial, setSelectedSocial] = useState(null);

  const onSave = () => {
    const tagsArray = [];
    if (selectedSleep) tagsArray.push(selectedSleep);
    if (selectedSocial) tagsArray.push(selectedSocial);

    const entry = {
      id: uuid.v4(),
      date: new Date().toISOString(),
      mood: mood.name,
      tags: tagsArray, 
      text: "", 
    };

    addEntry(entry);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={26} color="#00E676" /></TouchableOpacity>
        <Text style={styles.moodIcon}>{mood.icon}</Text>
        <TouchableOpacity onPress={onSave}><Ionicons name="checkmark-circle" size={32} color="#00E676" /></TouchableOpacity>
      </View>

      <Text style={styles.title}>What have you been up to?</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep</Text>
        <View style={styles.row}>
          {sleepOptions.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.option, selectedSleep === s.label && styles.selected]}
              onPress={() => setSelectedSleep(s.label)}
            >
              <Ionicons name={s.icon} size={26} color="#00E676" />
              <Text style={styles.optText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Social</Text>
        <View style={styles.row}>
          {socialOptions.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.option, selectedSocial === s.label && styles.selected]}
              onPress={() => setSelectedSocial(s.label)}
            >
              <Ionicons name={s.icon} size={26} color="#00E676" />
              <Text style={styles.optText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{flex:1}} />
      <View style={{padding:16}}>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={{color:'white',fontWeight:'700'}}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000',paddingTop:52},
  top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16},
  moodIcon:{fontSize:26,color:'#fff'},
  title:{color:'#fff',fontSize:22,textAlign:'center',marginVertical:18,fontWeight:'700'},
  card:{backgroundColor:'#222',marginHorizontal:16,padding:14,borderRadius:12,marginBottom:14},
  cardTitle:{color:'#fff',fontSize:16,marginBottom:12},
  row:{flexDirection:'row',justifyContent:'space-between'},
  option:{alignItems:'center',width:80},
  optText:{color:'#ddd',fontSize:12,marginTop:6,textAlign:'center'},
  selected:{borderWidth:2,borderColor:'#00E676',padding:6,borderRadius:10},
  saveBtn:{backgroundColor:'#00E676',padding:14,borderRadius:12,alignItems:'center'}
});
