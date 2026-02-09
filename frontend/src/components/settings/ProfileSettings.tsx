"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserDisplayName, getUserInitials } from "@/utils/greetings";
import {
  User,
  MapPin,
  BookOpen,
  Camera,
  Save,
  X,
} from "lucide-react";
import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/api-utils";

type SettingsBlob = {
  profile?: {
    location?: string;
    favoriteGenres?: string[];
  };
  preferences?: {
    readingGoal?: number;
    bookFormat?: string;
  };
};

export function ProfileSettings() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    favoriteGenres: [] as string[],
    avatar: "",
  });
  const [serverSettings, setServerSettings] = useState<SettingsBlob>({});
  const [readingGoal, setReadingGoal] = useState(24);
  const [bookFormat, setBookFormat] = useState("any");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Auto-populate from session when available
  useEffect(() => {
    if (session?.user) {
      const displayName = getUserDisplayName(session.user.name, session.user.email);
      const initials = getUserInitials(session.user.name, session.user.email);
      
      setProfile(prev => ({
        ...prev,
        name: session.user.name || displayName,
        email: session.user.email || "",
        avatar: initials,
      }));
    }
  }, [session]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [userResult, prefResult] = await Promise.allSettled([
          apiClient.get("/api/user/me"),
          apiClient.get("/api/user/preferences"),
        ]);

        if (userResult.status === "rejected") {
          throw userResult.reason;
        }

        let prefData: any = null;
        if (prefResult.status === "fulfilled") {
          prefData = prefResult.value.data;
        } else if ((prefResult.reason as any)?.response?.status !== 404) {
          throw prefResult.reason;
        }

        const userData = userResult.value.data;
        const settings: SettingsBlob = prefData?.settings ?? {};

        if (!isMounted) return;

        setProfile((prev) => ({
          ...prev,
          name: userData?.name || prev.name,
          email: userData?.email || prev.email,
          bio: userData?.bio || prev.bio,
          location: settings.profile?.location ?? prev.location,
          favoriteGenres: settings.profile?.favoriteGenres ?? prev.favoriteGenres,
        }));
        setReadingGoal(settings.preferences?.readingGoal ?? 24);
        setBookFormat(settings.preferences?.bookFormat ?? "any");
        setServerSettings(settings);
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const [newGenre, setNewGenre] = useState("");

  const availableGenres = [
    "Fantasy", "Science Fiction", "Mystery", "Romance", "Thriller",
    "Historical Fiction", "Literary Fiction", "Non-Fiction", "Biography",
    "Self-Help", "Poetry", "Drama", "Horror", "Adventure", "Comedy"
  ];

  const handleSave = () => {
    const saveProfile = async () => {
      setIsSaving(true);
      setError(null);
      setSaveMessage(null);
      try {
        const updatedSettings: SettingsBlob = {
          ...serverSettings,
          profile: {
            ...(serverSettings.profile ?? {}),
            location: profile.location,
            favoriteGenres: profile.favoriteGenres,
          },
          preferences: {
            ...(serverSettings.preferences ?? {}),
            readingGoal,
            bookFormat,
          },
        };

        await Promise.all([
          apiClient.patch("/api/user/me", {
            name: profile.name,
            bio: profile.bio,
          }),
          apiClient.put("/api/user/preferences", {
            settings: updatedSettings,
          }),
        ]);

        setServerSettings(updatedSettings);
        setSaveMessage("Profile saved.");
        router.push("/profile");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    };

    saveProfile();
  };

  const addGenre = () => {
    if (newGenre && !profile.favoriteGenres.includes(newGenre)) {
      setProfile(prev => ({
        ...prev,
        favoriteGenres: [...prev.favoriteGenres, newGenre]
      }));
      setNewGenre("");
    }
  };

  const removeGenre = (genre: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.filter(g => g !== genre)
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-serif mb-2">
          Profile Information
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Manage your personal information and reading preferences.
        </p>
      </div>

      {/* Profile Picture */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {profile.avatar}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-white transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              Profile Picture
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
              Upload a new profile picture or use your initials
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm">
                Upload Photo
              </button>
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300 rounded-lg transition-colors text-sm">
                Use Gravatar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Basic Information
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Your personal details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Email updates are managed by your sign-in provider.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 h-5 w-5" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself and your reading interests..."
            />
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl border border-amber-200 dark:border-slate-600 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Favorite Genres
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Select your preferred book genres
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-slate-600 text-amber-700 dark:text-slate-300 rounded-full text-sm"
              >
                {genre}
                <button
                  onClick={() => removeGenre(genre)}
                  className="hover:text-amber-900 dark:hover:text-slate-100 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select a genre...</option>
              {availableGenres
                .filter(genre => !profile.favoriteGenres.includes(genre))
                .map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
            </select>
            <button
              onClick={addGenre}
              disabled={!newGenre}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Add Genre
            </button>
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
              Customize your reading experience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Reading Goal (books per year)
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={readingGoal}
              onChange={(e) => setReadingGoal(parseInt(e.target.value || "0", 10))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Preferred Book Format
            </label>
            <select
              value={bookFormat}
              onChange={(e) => setBookFormat(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="physical">Physical Books</option>
              <option value="ebook">E-books</option>
              <option value="audiobook">Audiobooks</option>
              <option value="any">Any Format</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-amber-200 dark:border-slate-600">
        <button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg transition-colors font-medium"
        >
          <Save className="h-5 w-5" />
          {isSaving ? "Saving..." : "Save Profile"}
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
