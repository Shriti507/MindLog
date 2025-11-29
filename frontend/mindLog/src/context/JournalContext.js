import React, { createContext, useState, useEffect } from "react";
import uuid from "react-native-uuid";
import { getEntries, addEntry as storageAddEntry, saveEntries } from "../services/storage";

export const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
    const [entries, setEntries] = useState([]);

    //load data on mounting
    useEffect(() => {
        const loadInitialData = async () => {
            const storedEntries = await getEntries();
            setEntries(storedEntries);
        };
        loadInitialData();
    }, [])


    const addEntry = async (entry) => {

        const newEntries = await storageAddEntry(entry);
        setEntries(newEntries.reverse())

    }

    const deleteEntry = async (id) => {
        const updatedEntries = entries.filter((item) => item.id !== id);
        setEntries(updatedEntries);
        await saveEntries(updatedEntries);
    }

    const toggleFavorite = async (id) => {
        const updatedEntries = entries.map((e) =>
            e.id === id ? { ...e, favorite: !e.favorite } : e
        );
        setEntries(updatedEntries);
        await saveEntries(updatedEntries);
    };

    return (

        <JournalContext.Provider value={{ entries, addEntry, deleteEntry, toggleFavorite }}>
            {children}
        </JournalContext.Provider>
    )
}