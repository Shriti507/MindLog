import AsyncStorage from "@react-native-async-storage/async-storage"
const STORAGE_KEY='@mindlog_entries'

export const getEntries= async () => {
    try {
        const data=await AsyncStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch (err){
        console.log('error fetching entries',err)
        return []
    }
  }

  const saveAllEntries=async (entries) => {
    try {
    const data=JSON.stringify(entries);
    await AsyncStorage.setItem(STORAGE_KEY, data)
  } catch (err) {
    console.error("Error saving entries:", err)
  }
}

export const addEntry=async (newEntry) => {
  try {
    const currentEntries=await getEntries();
    const entryWithMeta = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...newEntry 
    }

    const updatedEntries=[...currentEntries, entryWithMeta]
    
    await saveAllEntries(updatedEntries)
    return updatedEntries
  } catch (err) {
    console.error("Failed to add entry:", err)
  }
}