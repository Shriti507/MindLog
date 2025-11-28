import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { JournalContext } from "../context/JournalContext";
import dayjs from "dayjs";

const MOODS = [
  { name: "rad", label: "rad", color: "#00E676", icon: "😄" },
  { name: "good", label: "good", color: "#AEEA00", icon: "🙂" },
  { name: "meh", label: "meh", color: "#64B5F6", icon: "😐" },
  { name: "bad", label: "bad", color: "#FF8C00", icon: "☹️" },
  { name: "awful", label: "awful", color: "#FF1744", icon: "😫" },
];

export default function HomeScreen({ navigation }) {
  const { entries } = useContext(JournalContext);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} color="white" />
        <Text style={styles.month}>November 2025</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="arrow-forward" size={22} color="white" style={{marginRight:10}}/>
          <Ionicons name="search" size={20} color="white" />
        </View>
      </View>

      {/* Mood box */}
      <View style={styles.moodBox}>
        <Text style={styles.how}>How are you?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.name}
              style={styles.moodItem}
              onPress={() => navigation.navigate("MoodDetail", { mood: m })}
            >
              <View style={[styles.moodCircle, { borderColor: m.color }]}>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              </View>
              <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* empty enteries k liye*/}
      {entries.length === 0 ? (
        <View style={styles.empty}>
          {/* placeholder lgaya entries k liye */}
          <View style={{width:200, height:200, backgroundColor:"#222", borderRadius:20}} />

          <Text style={styles.emptyText}>Let's add the first entry!{"\n"}Tap the big PLUS button.</Text>
          <Text style={styles.point}>👇</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.entryCard} onPress={() => {/* optional: open view screen */}}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{color:'#fff',fontWeight:'600'}}>{item.mood ?? "—"}</Text>
                <Text style={{color:'#aaa'}}>{dayjs(item.date).format("DD MMM")}</Text>
              </View>
              {item.text ? <Text style={{color:'#ddd',marginTop:6}} numberOfLines={2}>{item.text}</Text> : null}
              {item.sleep || item.social ? (
                <View style={{flexDirection:'row', marginTop:8, gap:12}}>
                  {item.sleep ? <Text style={styles.tag}>{item.sleep}</Text> : null}
                  {item.social ? <Text style={styles.tag}>{item.social}</Text> : null}
                </View>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom navigation bnana start kra yaha se with plus sign */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tab}><Ionicons name="newspaper-outline" size={22} color="#003E3E"/><Text style={styles.tabLabel}>Entries</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Ionicons name="stats-chart" size={22} color="#003E3E"/><Text style={styles.tabLabel}>Stats</Text></TouchableOpacity>

        <TouchableOpacity style={styles.plusBtn} onPress={() => navigation.navigate("JournalEntry")}>
          <View style={styles.plusInner}><Ionicons name="add" size={36} color="black"/></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}><Ionicons name="calendar-outline" size={22} color="#003E3E"/><Text style={styles.tabLabel}>Calendar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Ionicons name="ellipsis-horizontal" size={22} color="#003E3E"/><Text style={styles.tabLabel}>More</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'},
  header:{paddingTop:48,paddingHorizontal:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  month:{color:'white',fontSize:20,fontWeight:'700'},
  moodBox:{marginTop:18,backgroundColor:'#1F1F1F',marginHorizontal:16,borderRadius:14,padding:14},
  how:{color:'white',textAlign:'center',fontSize:18,fontWeight:'600',marginBottom:10},
  moodRow:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:8},
  moodItem:{alignItems:'center',width:60},
  moodCircle:{width:56,height:56,borderRadius:28,justifyContent:'center',alignItems:'center',borderWidth:2},
  moodLabel:{marginTop:6,fontSize:12,color:'#ddd'},
  empty:{flex:1,justifyContent:'center',alignItems:'center'},
  emptyText:{color:'#fff',textAlign:'center',marginTop:12,fontSize:16},
  point:{fontSize:28,color:'#ffd24d',marginTop:6},
  bottomBar:{height:72,backgroundColor:'#2FE0C2',flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingHorizontal:8},
  tab:{alignItems:'center'},
  tabLabel:{fontSize:11,color:'#003E3E',marginTop:2},
  plusBtn:{width:72,height:72, borderRadius:36, marginTop:-36, alignItems:'center', justifyContent:'center'},
  plusInner:{backgroundColor:'#2FE0C2',width:72,height:72,borderRadius:36,alignItems:'center',justifyContent:'center',elevation:4},
  entryCard:{backgroundColor:'#111', padding:14, marginHorizontal:16, marginTop:12, borderRadius:12}
});
