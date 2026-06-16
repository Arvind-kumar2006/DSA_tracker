import { createContext, useContext, useState, useCallback } from 'react';
import { fetchSettings, updateSettings as apiUpdate } from '../api/settings.js';

const SettingsContext = createContext(null);

const defaultSettings = {
  revisionIntervals: { 1: 2, 2: 3, 3: 5, 4: 7, 5: 10 },
  platforms: [],
  solveStatuses: [],
  tags: [],
  interviewTargetDate: null,
  weeklyEmailEnabled: true,
  pushNotificationsEnabled: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(async () => {
    const data = await fetchSettings();
    setSettings(data);
    setLoaded(true);
    return data;
  }, []);

  const updateSettings = async (data) => {
    const updated = await apiUpdate(data);
    setSettings(updated);
    return updated;
  };

  return (
    <SettingsContext.Provider value={{ settings, loaded, loadSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
