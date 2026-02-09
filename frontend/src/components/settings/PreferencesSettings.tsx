"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  Moon,
  Sun,
  BookOpen,
  Eye,
  Bell,
  Settings as SettingsIcon,
} from "lucide-react";
import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/api-utils";

type NotificationChannels = {
  email: Record<string, boolean>;
  push: Record<string, boolean>;
  inApp: Record<string, boolean>;
  sound?: {
    enabled?: boolean;
    volume?: number;
  };
};

type PrivacySettings = {
  profile?: {
    showEmail?: boolean;
    showLocation?: boolean;
    showBio?: boolean;
    showReadingGoal?: boolean;
  };
  reading?: {
    showCurrentlyReading?: boolean;
    showReadingProgress?: boolean;
    showReviews?: boolean;
    showRatings?: boolean;
    showReadingHistory?: boolean;
  };
  social?: {
    allowMessages?: boolean;
    allowFriendRequests?: boolean;
    showInSearch?: boolean;
    showOnlineStatus?: boolean;
  };
  data?: {
    allowAnalytics?: boolean;
    allowPersonalization?: boolean;
    allowMarketing?: boolean;
  };
};

type SettingsBlob = {
  preferences?: {
    dateFormat?: string;
    readingGoal?: number;
    bookFormat?: string;
    autoSave?: boolean;
  };
  notifications?: NotificationChannels;
  privacy?: PrivacySettings;
  profile?: {
    location?: string;
    favoriteGenres?: string[];
  };
};

const defaultNotifications: NotificationChannels = {
  email: {
    newMessages: true,
    groupUpdates: true,
    bookRecommendations: false,
    readingReminders: true,
    weeklyDigest: true,
  },
  push: {
    newMessages: true,
    groupUpdates: false,
    bookRecommendations: true,
    readingReminders: false,
    weeklyDigest: false,
  },
  inApp: {
    newMessages: true,
    groupUpdates: true,
    bookRecommendations: true,
    readingReminders: true,
    weeklyDigest: true,
  },
  sound: {
    enabled: true,
    volume: 70,
  },
};

const defaultPrivacy: PrivacySettings = {
  profile: {
    showEmail: false,
    showLocation: true,
    showBio: true,
    showReadingGoal: true,
  },
  reading: {
    showCurrentlyReading: true,
    showReadingProgress: true,
    showReviews: true,
    showRatings: true,
    showReadingHistory: false,
  },
  social: {
    allowMessages: true,
    allowFriendRequests: true,
    showInSearch: true,
    showOnlineStatus: true,
  },
  data: {
    allowAnalytics: true,
    allowPersonalization: true,
    allowMarketing: false,
  },
};

const channelEnabled = (channel?: Record<string, boolean>) =>
  channel ? Object.values(channel).some(Boolean) : false;

export function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    theme: "system", // "light", "dark", "system"
    language: "en",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    readingGoal: 24,
    bookFormat: "any",
    autoSave: true,
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    privacy: {
      showReadingProgress: true,
      showCurrentlyReading: true,
      showReviews: true,
      allowMessages: true,
    },
  });
  const [serverSettings, setServerSettings] = useState<SettingsBlob>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get("/api/user/preferences");
        const settings: SettingsBlob = data?.settings ?? {};
        const notifications = settings.notifications ?? defaultNotifications;
        const privacy = settings.privacy ?? defaultPrivacy;
        const prefOverrides = settings.preferences ?? {};

        if (!isMounted) return;

        setServerSettings(settings);
        setPreferences((prev) => ({
          ...prev,
          theme:
            data?.theme === "LIGHT"
              ? "light"
              : data?.theme === "DARK"
              ? "dark"
              : data?.theme === "SYSTEM"
              ? "system"
              : prev.theme,
          language: data?.language ?? prev.language,
          timezone: data?.timezone ?? prev.timezone,
          dateFormat: prefOverrides.dateFormat ?? prev.dateFormat,
          readingGoal: prefOverrides.readingGoal ?? prev.readingGoal,
          bookFormat: prefOverrides.bookFormat ?? prev.bookFormat,
          autoSave: prefOverrides.autoSave ?? prev.autoSave,
          notifications: {
            email: channelEnabled(notifications.email),
            push: channelEnabled(notifications.push),
            inApp: channelEnabled(notifications.inApp),
          },
          privacy: {
            showReadingProgress:
              privacy.reading?.showReadingProgress ?? prev.privacy.showReadingProgress,
            showCurrentlyReading:
              privacy.reading?.showCurrentlyReading ?? prev.privacy.showCurrentlyReading,
            showReviews: privacy.reading?.showReviews ?? prev.privacy.showReviews,
            allowMessages: privacy.social?.allowMessages ?? prev.privacy.allowMessages,
          },
        }));
      } catch (err) {
        const status = (err as any)?.response?.status;
        if (status === 404) {
          if (isMounted) {
            setServerSettings({});
          }
          return;
        }
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = (category: 'notifications' | 'privacy', setting: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !(prev[category] as any)[setting],
      },
    }));
  };

  const handleSave = () => {
    const savePreferences = async () => {
      setIsSaving(true);
      setError(null);
      setSaveMessage(null);
      try {
        const existingSettings = serverSettings ?? {};
        const existingNotifications = existingSettings.notifications ?? defaultNotifications;
        const updatedNotifications: NotificationChannels = {
          ...existingNotifications,
          email: Object.keys(existingNotifications.email).reduce((acc, key) => {
            acc[key] = preferences.notifications.email;
            return acc;
          }, {} as Record<string, boolean>),
          push: Object.keys(existingNotifications.push).reduce((acc, key) => {
            acc[key] = preferences.notifications.push;
            return acc;
          }, {} as Record<string, boolean>),
          inApp: Object.keys(existingNotifications.inApp).reduce((acc, key) => {
            acc[key] = preferences.notifications.inApp;
            return acc;
          }, {} as Record<string, boolean>),
        };

        const updatedSettings: SettingsBlob = {
          ...existingSettings,
          preferences: {
            ...existingSettings.preferences,
            dateFormat: preferences.dateFormat,
            readingGoal: preferences.readingGoal,
            bookFormat: preferences.bookFormat,
            autoSave: preferences.autoSave,
          },
          privacy: {
            ...existingSettings.privacy,
            reading: {
              ...(existingSettings.privacy?.reading ?? defaultPrivacy.reading),
              showReadingProgress: preferences.privacy.showReadingProgress,
              showCurrentlyReading: preferences.privacy.showCurrentlyReading,
              showReviews: preferences.privacy.showReviews,
            },
            social: {
              ...(existingSettings.privacy?.social ?? defaultPrivacy.social),
              allowMessages: preferences.privacy.allowMessages,
            },
          },
          notifications: updatedNotifications,
        };

        await apiClient.put("/api/user/preferences", {
          theme:
            preferences.theme === "light"
              ? "LIGHT"
              : preferences.theme === "dark"
              ? "DARK"
              : "SYSTEM",
          language: preferences.language,
          timezone: preferences.timezone,
          notificationsEmail: preferences.notifications.email,
          settings: updatedSettings,
        });

        setServerSettings(updatedSettings);
        setSaveMessage("Preferences saved.");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    };

    savePreferences();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-2">
          App Preferences
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Customize your reading experience and app settings.
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Appearance
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Customize the look and feel of your app
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Theme
            </label>
            <div className="space-y-2">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: SettingsIcon },
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-600/50 rounded-lg cursor-pointer hover:bg-white/70 dark:hover:bg-slate-600/70 transition-colors">
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={preferences.theme === value}
                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <Icon className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                  <span className="text-gray-900 dark:text-slate-100">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reading Preferences */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Reading Preferences
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Set your reading goals and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Annual Reading Goal
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={preferences.readingGoal}
              onChange={(e) => setPreferences(prev => ({ ...prev, readingGoal: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Books per year
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Preferred Book Format
            </label>
            <select
              value={preferences.bookFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, bookFormat: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="any">Any Format</option>
              <option value="physical">Physical Books</option>
              <option value="ebook">E-books</option>
              <option value="audiobook">Audiobooks</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-600/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-slate-100">Auto-save Progress</h4>
              <p className="text-sm text-gray-600 dark:text-slate-400">Automatically save your reading progress</p>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, autoSave: !prev.autoSave }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoSave ? "bg-amber-500" : "bg-gray-300 dark:bg-slate-500"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoSave ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Notifications
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "push", label: "Push Notifications", desc: "Get notifications on your device" },
            { key: "inApp", label: "In-App Notifications", desc: "Show notifications within the app" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-600/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100">{label}</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">{desc}</p>
              </div>
              <button
                onClick={() => handleToggle("notifications", key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications[key as keyof typeof preferences.notifications]
                    ? "bg-amber-500"
                    : "bg-gray-300 dark:bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications[key as keyof typeof preferences.notifications]
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Privacy Settings
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Control what others can see about your reading activity
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "showReadingProgress", label: "Show Reading Progress", desc: "Let others see your reading progress" },
            { key: "showCurrentlyReading", label: "Show Currently Reading", desc: "Display books you're currently reading" },
            { key: "showReviews", label: "Show Reviews", desc: "Make your reviews visible to others" },
            { key: "allowMessages", label: "Allow Messages", desc: "Let other users send you messages" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-600/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100">{label}</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">{desc}</p>
              </div>
              <button
                onClick={() => handleToggle("privacy", key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.privacy[key as keyof typeof preferences.privacy]
                    ? "bg-amber-500"
                    : "bg-gray-300 dark:bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.privacy[key as keyof typeof preferences.privacy]
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-amber-200 dark:border-slate-600">
        <button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg transition-colors font-medium"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
      {(error || saveMessage) && (
        <div className="flex justify-end">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{saveMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
