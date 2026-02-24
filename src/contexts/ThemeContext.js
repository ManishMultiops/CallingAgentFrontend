import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

// Create the Context
const ThemeContext = createContext();

// Custom hook to use the ThemeContext
export const useAppTheme = () => {
    return useContext(ThemeContext);
};

export const AppThemeProvider = ({ children }) => {
    // Initialize state with value from localStorage or explicitly default to 'light' per user instructions
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('appThemeMode');
        // If we have a saved preference, use it. Otherwise, default strictly to 'light'.
        return savedMode || 'light';
    });

    // Whenever the mode changes, persist it to localStorage
    useEffect(() => {
        localStorage.setItem('appThemeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const contextValue = useMemo(
        () => ({
            mode,
            toggleTheme,
        }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};
