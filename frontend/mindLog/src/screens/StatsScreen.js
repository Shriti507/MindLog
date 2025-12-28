import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInsights } from '../services/insights';


const MOOD_EMOJIS = {
  'rad': '😄',
  'good': '🙂',
  'meh': '😐',
  'bad': '☹️',
  'awful': '😫',
};


const getMoodColor = (moodName) => {
  switch (moodName) {
    case 'rad': return '#00E676';
    case 'good': return '#AEEA00';
    case 'meh': return '#64B5F6';
    case 'bad': return '#FF8C00';
    case 'awful': return '#FF1744';
    default: return '#555';
  }
}


const MoodTrendPlaceholder = ({ moodTrendData }) => {

  const displayData = moodTrendData.slice(-7);

  if (displayData.length === 0) {
    return (
      <View style={styles.chartPlaceholder}>
        <Text style={styles.noDataText}>No mood data available for visualization.</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Mood Trend (Last {displayData.length} Entries)</Text>
      <View style={styles.trendRow}>

        {displayData.map((data, index) => (
          <View key={index} style={styles.dayColumn}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{MOOD_EMOJIS[data.moodName]}</Text>
            <Text style={styles.dayLabel}>{data.date.substring(0, data.date.lastIndexOf('/'))}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};


export default function StatsScreen({ navigation }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);


  const fetchInsights = useCallback(async (days) => {
    setLoading(true);
    const data = await getInsights(days);
    setInsights(data);
    setLoading(false);
  }, []);


  useEffect(() => {
    fetchInsights(timeframe);
  }, [timeframe, fetchInsights]);

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#00E676" /></View>;
  }

  const { mostCommonMood, mostCommonTag, summaryMessage, moodTrendData, timePeriod } = insights;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Insights</Text>
        <View style={{ width: 24 }} />
      </View>


      <View style={styles.timeSelector}>
        <TouchableOpacity
          style={[styles.timeBtn, timeframe === 7 && styles.timeBtnActive]}
          onPress={() => setTimeframe(7)}
        >
          <Text style={timeframe === 7 ? styles.timeTextActive : styles.timeText}>Last 7 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeBtn, timeframe === 30 && styles.timeBtnActive]}
          onPress={() => setTimeframe(30)}
        >
          <Text style={timeframe === 30 ? styles.timeTextActive : styles.timeText}>Last 30 Days</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.summaryCard}>
        <Ionicons name="bulb-outline" size={24} color="#2FE0C2" />
        <Text style={styles.summaryText}>
          {summaryMessage}
        </Text>
      </View>


      <MoodTrendPlaceholder moodTrendData={moodTrendData} />

      <Text style={styles.sectionTitle}>Key Statistics ({timePeriod} Days)</Text>


      <View style={styles.statsRow}>


        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Most Common Mood</Text>
          <View style={styles.statValueRow}>
            <View style={[styles.moodStatCircle, { borderColor: getMoodColor(mostCommonMood.name) }]}>
              <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[mostCommonMood.name]}</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{mostCommonMood.name.toUpperCase()}</Text>
              <Text style={styles.statCount}>Appeared {mostCommonMood.count} {mostCommonMood.count === 1 ? 'time' : 'times'}</Text>
            </View>
          </View>
        </View>


        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Most Frequent Tag</Text>
          <View style={styles.statValueRow}>
            <Ionicons name="bookmark" size={30} color="#00E676" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.statValue}>{mostCommonTag.name.toUpperCase()}</Text>
              <Text style={styles.statCount}>Used in {mostCommonTag.count} {mostCommonTag.count === 1 ? 'entry' : 'entries'}</Text>
            </View>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    paddingTop: 52,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },


  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 5,
  },
  timeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeBtnActive: {
    backgroundColor: '#00E676',
  },
  timeText: {
    color: '#888',
    fontWeight: '600',
  },
  timeTextActive: {
    color: '#000',
    fontWeight: '700',
  },


  chartContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 5,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 40,
  },
  dayLabel: {
    color: '#888',
    fontSize: 10,
  },


  summaryCard: {
    backgroundColor: '#111',
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2FE0C2',
  },
  summaryText: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 10,
  },


  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodStatCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statCount: {
    fontSize: 12,
    color: '#00E676',
  },
});
