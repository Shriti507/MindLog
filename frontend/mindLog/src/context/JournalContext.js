import React, { createContext, useState, useEffect } from "react";
import uuid from "react-native-uuid";

export const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
    const [entries, setEntries] = useState([]);

    const addEntry = (entry) => {
        setEntries((prev) => [entry, ...prev]);
    };

    const deleteEntry = (id) => {
        setEntries((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <JournalContext.Provider value={{ entries, addEntry, deleteEntry }}>
            {children}
        </JournalContext.Provider>
    );
};
