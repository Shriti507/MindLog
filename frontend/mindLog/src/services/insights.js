import { getEntries } from './storage'

// numerical mapping for scoring 
const MOOD_SCORES = {
  'rad': 2,
  'good': 1,
  'meh': 0,
  'bad': -1,
  'awful': -2,
}


 // calculate total score and the frequency counts for moods and tags.
 
const calculateFrequencies = (entries) => {
  const moodCounts = {};
  const tagCounts = {};
  let totalScore = 0;
  
  entries.forEach(entry => {
    // mood and score calculation
    const mood = entry.mood;
    if (mood && MOOD_SCORES[mood] !== undefined) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1
      totalScore += MOOD_SCORES[mood]
    }
    
    // tag calculation
    const tags = entry.tags
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  
  return { moodCounts, tagCounts, totalScore };
};


export const getInsights = async (days = 7) => { 
 
  const findMostCommon = (counts) => {
    return Object.entries(counts).reduce(
      (acc, [key, value]) => {
        if (value > acc.count) {
          return { name: key, count: value };
        }
        return acc
      },
      { name: 'N/A', count: 0 } 
    )
  }
  

  const allEntries = await getEntries();
  
  // filter entries for the specific time
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = allEntries.filter(entry => {
    return new Date(entry.timestamp) >= cutoffDate;
  });
  
  if (recentEntries.length === 0) {
    // no entries calculate 
    return {
      mostCommonMood: { name: 'N/A', count: 0 },
      mostCommonTag: { name: 'N/A', count: 0 },
      summaryMessage: `No entries in the last ${days} days. Start logging your mood!`,
      moodTrendData: [],
    }
  }

  // frequency calculations and average score
  const { moodCounts, tagCounts, totalScore } = calculateFrequencies(recentEntries);
  const totalEntries = recentEntries.length;
  const averageScore = totalScore / totalEntries

  
  const mostCommonMood = findMostCommon(moodCounts)
  const mostCommonTag = findMostCommon(tagCounts)

  // summary
  let summaryMessage = "";
  const mostMood = mostCommonMood.name.toUpperCase();
  const mostTag = mostCommonTag.name;

  if (averageScore >= 1.5) {
    // very positive
    summaryMessage = `You've had a fantastic streak! Your most common mood was ${mostMood}. It seems like your focus on ${mostTag} is really paying off!`;
  } else if (averageScore >= 0.5) {
    // medium positive
    summaryMessage = `Things are looking up! Your average mood is positive, and ${mostTag} was your most frequent activity. Keep seeking out what brings you joy.`;
  } else if (averageScore <= -1.0) {
    
    if (mostTag !== 'N/A') {
        summaryMessage = `It looks like you've been having a tough time. Your most frequent tag was "${mostTag}". Take a moment to reflect on how this activity is impacting your mood.`;
    } else {
        summaryMessage = `You've faced some challenges this period. Remember to be kind to yourself and log your activities to find potential triggers.`;
    }
  } else {
    // neutral
    if (mostTag !== 'N/A') {
        summaryMessage = `Your mood is stable and centered around ${mostMood}. Your most frequent activity was "${mostTag}". Continue building a consistent routine.`;
    } else {
        summaryMessage = `Your mood has been generally steady. Keep logging to help uncover any subtle patterns in the coming weeks.`;
    }
  }


  
  const moodTrendData = recentEntries.map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    moodValue: MOOD_SCORES[entry.mood] || 0,
    moodName: entry.mood,
  }));
  
  return {
    timePeriod: days,
    mostCommonMood,
    mostCommonTag,
    summaryMessage,
    moodTrendData,
  }
}

export { MOOD_SCORES,calculateFrequencies }