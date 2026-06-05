import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";
import { CloudAPI } from "../../services/api";
import { supabase } from "../../services/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const resolvedName =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Usuario";
        setUserName(resolvedName);
        setFullName(resolvedName);
        setEmail(user.email || "");
      }
    };
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const nextName = fullName.trim();
      if (!nextName) {
        Alert.alert("Error", "Ingresa un nombre válido");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: { full_name: nextName },
      });

      if (error) throw error;

      setUserName(nextName);
      Alert.alert("Perfil actualizado", "Tu nombre se guardó correctamente.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        Alert.alert("Error", "Completa ambos campos de contraseña");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
        return;
      }

      setSavingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(
        "Contraseña actualizada",
        "Tu contraseña se cambió correctamente.",
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await CloudAPI.logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Cuenta de {userName}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mi cuenta</Text>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.dark.textMuted}
          />
          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
          />
          <Button
            title="Guardar cambios"
            onPress={handleSaveProfile}
            loading={savingProfile}
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nueva contraseña"
            placeholderTextColor={Colors.dark.textMuted}
            secureTextEntry
          />
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmar contraseña"
            placeholderTextColor={Colors.dark.textMuted}
            secureTextEntry
          />
          <Button
            title="Cambiar contraseña"
            onPress={handleChangePassword}
            loading={savingPassword}
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sesión</Text>
          <Text style={styles.description}>
            Cierra tu sesión actual para salir de la cuenta en este dispositivo.
          </Text>
          <Button
            title="Cerrar sesión"
            onPress={handleLogout}
            variant="secondary"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 16,
  },
  cardTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.dark.cardSecondary,
    color: Colors.dark.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  disabledInput: {
    opacity: 0.7,
  },
  description: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionBtn: {
    marginTop: 16,
  },
  subtitle: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    marginBottom: 24,
  },
});
