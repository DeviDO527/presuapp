import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const expoExtras = Constants.expoConfig?.extra as
  | {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    }
  | undefined;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  expoExtras?.supabaseUrl ||
  expoExtras?.SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  expoExtras?.supabaseAnonKey ||
  expoExtras?.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase no está configurado. Define EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo .env, o agrega supabaseUrl y supabaseAnonKey en extra de Expo.",
  );
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL tiene un formato inválido. Debe ser una URL completa como https://tu-proyecto.supabase.co",
  );
}

const ExpoStorage = {
  getItem: (key: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") return null;
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
