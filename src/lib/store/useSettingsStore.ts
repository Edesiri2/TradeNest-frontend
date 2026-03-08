import { create } from 'zustand';
import { settingsApi } from '../api/settingsApi';
import { defaultBusinessSettings, type BusinessSettings } from '../../types/settings';

interface SettingsState {
  settings: BusinessSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (payload: Partial<BusinessSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultBusinessSettings,
  loading: false,
  saving: false,
  error: null,
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await settingsApi.getSettings();
      set({
        settings: {
          ...defaultBusinessSettings,
          ...(response.data || {})
        },
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  updateSettings: async (payload) => {
    set({ saving: true, error: null });
    try {
      const response = await settingsApi.updateSettings(payload);
      set({
        settings: {
          ...get().settings,
          ...(response.data || payload)
        },
        saving: false
      });
    } catch (error: any) {
      set({ error: error.message, saving: false });
      throw error;
    }
  }
}));
