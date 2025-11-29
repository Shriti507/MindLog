import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ScrollView,
    Share,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { JournalContext } from '../context/JournalContext';

dayjs.extend(isBetween);

const { width } = Dimensions.get('window');

// Concept: Predefined Prompts
const PROMPTS = [
    "What made you smile today?",
    "What was the biggest challenge you faced?",
    "List three things you are grateful for.",
    "How did you take care of yourself today?",
    "What is one thing you learned today?",
    "Who made a positive impact on your day?",
];

// Concept: Mood Colors (Adapted to App Theme)
const MOOD_COLORS = {
    rad: "#00E676",
    good: "#AEEA00",
    meh: "#64B5F6",
    bad: "#FF8C00",
    awful: "#FF1744",
    default: '#333'
};

// Optimization: Memoized Day Item
const DayItem = React.memo(({ item, isSelected, isToday, moodColor, onPress }) => {
    if (item.empty) return <View style={styles.dayItem} />;

    return (
        <TouchableOpacity
            style={[
                styles.dayItem,
                isSelected && styles.selectedItem,
                isToday && !isSelected && styles.todayItem
            ]}
            onPress={() => onPress(item.date)}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.dayText,
                isSelected && styles.selectedText,
                isToday && !isSelected && styles.todayText
            ]}>
                {item.date.date()}
            </Text>
            {moodColor && <View style={[styles.moodDot, { backgroundColor: moodColor }]} />}
        </TouchableOpacity>
    );
});

// Optimization: Memoized Filter Chip
const FilterChip = React.memo(({ item, isSelected, onPress }) => (
    <TouchableOpacity
        style={[styles.filterChip, isSelected && styles.filterChipActive]}
        onPress={() => onPress(item)}
    >
        <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{item}</Text>
    </TouchableOpacity>
));

const CalendarScreen = ({ navigation }) => {
    const { entries } = useContext(JournalContext);
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [statsPeriod, setStatsPeriod] = useState(7);
    const [dailyPrompt, setDailyPrompt] = useState("");

    useEffect(() => {
        const random = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        setDailyPrompt(random);
    }, []);

    // Concept: Calendar Grid Generation
    const days = useMemo(() => {
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startDay = startOfMonth.day();
        const daysInMonth = endOfMonth.date();

        const grid = [];
        for (let i = 0; i < startDay; i++) grid.push({ id: `empty-${i}`, empty: true });
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({
                id: i.toString(),
                date: startOfMonth.date(i),
                empty: false
            });
        }
        return grid;
    }, [currentDate]);

    // Concept: Filtering Logic
    const filteredEntries = useMemo(() => {
        if (selectedFilter === 'All') return entries;
        return entries.filter(e => e.mood?.toLowerCase() === selectedFilter.toLowerCase());
    }, [entries, selectedFilter]);

    const getEntryForDay = useCallback((date) => {
        return filteredEntries.find(e => dayjs(e.date).isSame(date, 'day'));
    }, [filteredEntries]);

    // Concept: Insights Calculation
    const insights = useMemo(() => {
        const cutoff = dayjs().subtract(statsPeriod, 'day');
        const recentEntries = entries.filter(e => dayjs(e.date).isAfter(cutoff));

        if (recentEntries.length === 0) return null;

        const moodCounts = {};
        const tagCounts = {};

        recentEntries.forEach(e => {
            if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
            if (e.sleep) tagCounts[e.sleep] = (tagCounts[e.sleep] || 0) + 1;
            if (e.social) tagCounts[e.social] = (tagCounts[e.social] || 0) + 1;
        });

        const topMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];
        const topTag = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])[0];

        const trendList = Object.keys(moodCounts).map(mood => ({
            mood,
            count: moodCounts[mood],
            color: MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.default
        })).sort((a, b) => b.count - a.count);

        return { topMood, topTag, count: recentEntries.length, trendList };
    }, [entries, statsPeriod]);

    const handleExport = useCallback(async () => {
        const cutoff = dayjs().subtract(statsPeriod, 'day');
        const exportData = entries
            .filter(e => dayjs(e.date).isAfter(cutoff))
            .map(e => `${dayjs(e.date).format('YYYY-MM-DD')}: ${e.mood} - ${e.text || 'No text'}`)
            .join('\n');

        if (!exportData) {
            Alert.alert("No Data", "No entries found for this period.");
            return;
        }

        try {
            await Share.share({
                message: `My MindLog Entries (${statsPeriod} days):\n\n${exportData}`,
            });
        } catch (error) {
            console.log(error.message);
        }
    }, [entries, statsPeriod]);

    const renderDay = useCallback(({ item }) => {
        const entry = !item.empty ? getEntryForDay(item.date) : null;
        const moodColor = entry ? MOOD_COLORS[entry.mood?.toLowerCase()] || MOOD_COLORS.default : null;
        const isSelected = !item.empty && item.date.isSame(selectedDate, 'day');
        const isToday = !item.empty && item.date.isSame(dayjs(), 'day');

        return (
            <DayItem
                item={item}
                isSelected={isSelected}
                isToday={isToday}
                moodColor={moodColor}
                onPress={setSelectedDate}
            />
        );
    }, [getEntryForDay, selectedDate]);

    const renderFilterItem = useCallback(({ item }) => (
        <FilterChip
            item={item}
            isSelected={selectedFilter === item}
            onPress={setSelectedFilter}
        />
    ), [selectedFilter]);

    const selectedEntry = useMemo(() => getEntryForDay(selectedDate), [getEntryForDay, selectedDate]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar</Text>
                <TouchableOpacity onPress={handleExport} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="share-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                <View style={styles.promptCard}>
                    <View style={styles.promptHeader}>
                        <Ionicons name="bulb-outline" size={20} color="#FFD700" />
                        <Text style={styles.promptLabel}>Daily Prompt</Text>
                    </View>
                    <Text style={styles.promptText}>{dailyPrompt}</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.monthNav}>
                        <TouchableOpacity onPress={() => setCurrentDate(d => d.subtract(1, 'month'))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="chevron-back" size={24} color="#888" />
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>{currentDate.format('MMMM YYYY')}</Text>
                        <TouchableOpacity onPress={() => setCurrentDate(d => d.add(1, 'month'))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="chevron-forward" size={24} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekRow}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <Text key={i} style={styles.weekText}>{d}</Text>
                        ))}
                    </View>

                    <FlatList
                        data={days}
                        renderItem={renderDay}
                        keyExtractor={item => item.id}
                        numColumns={7}
                        scrollEnabled={false}
                        contentContainerStyle={styles.grid}
                        initialNumToRender={42}
                    />
                </View>

                <View style={styles.selectedDateContainer}>
                    <Text style={styles.selectedDateTitle}>
                        {selectedDate.format('dddd, DD MMMM YYYY')}
                    </Text>
                    {selectedEntry ? (
                        <View style={styles.entryPreview}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <View style={[styles.moodDotLarge, { backgroundColor: MOOD_COLORS[selectedEntry.mood?.toLowerCase()] || '#888' }]} />
                                <Text style={styles.entryMood}>{selectedEntry.mood}</Text>
                            </View>
                            {selectedEntry.text ? <Text style={styles.entryText}>{selectedEntry.text}</Text> : null}
                            <View style={styles.tagsRow}>
                                {selectedEntry.sleep && <Text style={styles.tag}>{selectedEntry.sleep}</Text>}
                                {selectedEntry.social && <Text style={styles.tag}>{selectedEntry.social}</Text>}
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.noEntryText}>No entry for this day.</Text>
                    )}
                </View>

                <View style={styles.filterRow}>
                    <FlatList
                        horizontal
                        data={['All', 'rad', 'good', 'meh', 'bad', 'awful']}
                        keyExtractor={item => item}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                        renderItem={renderFilterItem}
                    />
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Trends & Insights</Text>
                        <View style={styles.periodToggle}>
                            <TouchableOpacity onPress={() => setStatsPeriod(7)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.periodText, statsPeriod === 7 && styles.periodActive]}>7D</Text>
                            </TouchableOpacity>
                            <Text style={{ color: '#444' }}>|</Text>
                            <TouchableOpacity onPress={() => setStatsPeriod(30)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.periodText, statsPeriod === 30 && styles.periodActive]}>30D</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {insights ? (
                        <>
                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statLabel}>Top Mood</Text>
                                    <Text style={[styles.statValue, { color: MOOD_COLORS[insights.topMood?.toLowerCase()] }]}>
                                        {insights.topMood || '—'}
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statLabel}>Top Tag</Text>
                                    <Text style={styles.statValue}>{insights.topTag || '—'}</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statLabel}>Entries</Text>
                                    <Text style={styles.statValue}>{insights.count}</Text>
                                </View>
                            </View>

                            <View style={styles.trendList}>
                                <Text style={styles.subHeader}>Mood Distribution</Text>
                                {insights.trendList.map((item, index) => (
                                    <View key={index} style={styles.trendItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <View style={[styles.moodDot, { backgroundColor: item.color }]} />
                                            <Text style={styles.trendLabel}>{item.mood}</Text>
                                        </View>
                                        <Text style={styles.trendCount}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>

                            {insights.topMood && (
                                <View style={styles.summaryBox}>
                                    <Text style={styles.summaryText}>
                                        You've been feeling mostly <Text style={{ fontWeight: 'bold', color: MOOD_COLORS[insights.topMood?.toLowerCase()] }}>{insights.topMood}</Text> lately.
                                        {insights.topTag ? ` Your sleep/social pattern often involves "${insights.topTag}".` : ''}
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={styles.noDataText}>Not enough data for insights yet.</Text>
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#000'
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },

    promptCard: {
        backgroundColor: '#1A1A1A', margin: 20, padding: 16, borderRadius: 16,
        borderLeftWidth: 4, borderLeftColor: '#FFD700'
    },
    promptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    promptLabel: { color: '#FFD700', fontWeight: '600', fontSize: 14 },
    promptText: { color: '#FFF', fontSize: 16, lineHeight: 24, fontWeight: '500' },

    sectionContainer: { marginHorizontal: 20, marginBottom: 24 },
    monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },

    weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    weekText: { color: '#666', width: (width - 40) / 7, textAlign: 'center', fontSize: 12 },
    grid: {},
    dayItem: { width: (width - 40) / 7, height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
    todayItem: { backgroundColor: '#222', borderRadius: 22 },
    selectedItem: { backgroundColor: '#2FE0C2', borderRadius: 22 }, // Changed to Teal
    dayText: { color: '#FFF', fontSize: 14 },
    todayText: { color: '#2FE0C2', fontWeight: 'bold' }, // Changed to Teal
    selectedText: { color: '#000', fontWeight: 'bold' }, // Changed to Black for contrast on Teal
    moodDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
    moodDotLarge: { width: 12, height: 12, borderRadius: 6 },

    selectedDateContainer: { paddingHorizontal: 20, marginBottom: 24 },
    selectedDateTitle: { color: '#888', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    entryPreview: { backgroundColor: '#111', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
    entryMood: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    entryText: { color: '#CCC', fontSize: 14, marginTop: 4, lineHeight: 20 },
    noEntryText: { color: '#555', fontStyle: 'italic' },
    tagsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    tag: { backgroundColor: '#222', color: '#AAA', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },

    filterRow: { marginBottom: 24, height: 40 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#333' },
    filterChipActive: { backgroundColor: '#2FE0C2', borderColor: '#2FE0C2' }, // Changed to Teal
    filterText: { color: '#888', fontSize: 12 },
    filterTextActive: { color: '#000', fontWeight: '600' }, // Changed to Black

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    periodToggle: { flexDirection: 'row', gap: 12 },
    periodText: { color: '#666', fontSize: 14 },
    periodActive: { color: '#2FE0C2', fontWeight: 'bold' }, // Changed to Teal

    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
    statBox: { flex: 1, backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center' },
    statLabel: { color: '#666', fontSize: 12, marginBottom: 4 },
    statValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

    trendList: { backgroundColor: '#111', borderRadius: 12, padding: 16 },
    subHeader: { color: '#888', fontSize: 12, marginBottom: 12, textTransform: 'uppercase' },
    trendItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    trendLabel: { color: '#DDD', fontSize: 14 },
    trendCount: { color: '#FFF', fontWeight: 'bold' },

    noDataText: { color: '#666', fontStyle: 'italic' },
    summaryBox: { marginTop: 16, padding: 12, backgroundColor: '#1A1A1A', borderRadius: 8 },
    summaryText: { color: '#CCC', fontSize: 14, lineHeight: 20 }
});

export default CalendarScreen;
