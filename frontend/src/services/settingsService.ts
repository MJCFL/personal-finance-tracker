import { UserPreferences, defaultSettings } from '@/data/mockSettings';

const SETTINGS_KEY = 'user_settings';

export const settingsService = {
  saveSettings: (settings: UserPreferences): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  loadSettings: (): UserPreferences => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return defaultSettings;
  },

  // In a real app, these would make API calls to a backend
  async saveSettingsToServer(settings: UserPreferences): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    this.saveSettings(settings);
  },

  async loadSettingsFromServer(): Promise<UserPreferences> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.loadSettings();
  }
};
