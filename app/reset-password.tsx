import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Colors } from "../constants/Colors";
import { CloudAPI } from "../services/api";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvingLink, setResolvingLink] = useState(true);
  const processedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const showInvalidLinkAlert = () => {
      Alert.alert(
        "Sesión Inválida",
        "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/forgot-password"),
          },
        ],
      );
    };

    const hydrateInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (isMounted && initialUrl && !processedUrlRef.current) {
          processedUrlRef.current = initialUrl;
          await CloudAPI.setSessionFromUrl(initialUrl);
        }
      } catch (error: any) {
        console.error(
          "[ResetPassword] Error al establecer sesión inicial:",
          error,
        );
        showInvalidLinkAlert();
      } finally {
        if (isMounted) {
          setResolvingLink(false);
        }
      }
    };

    const subscription = Linking.addEventListener(
      "url",
      async ({ url: incomingUrl }) => {
        if (!incomingUrl || incomingUrl === processedUrlRef.current) {
          return;
        }

        processedUrlRef.current = incomingUrl;

        try {
          await CloudAPI.setSessionFromUrl(incomingUrl);
          if (isMounted) setResolvingLink(false);
        } catch (error: any) {
          console.error("[ResetPassword] Error al procesar URL:", error);
          if (isMounted) setResolvingLink(false);
          showInvalidLinkAlert();
        }
      },
    );

    // En React Native nativo, window.location no está disponible.
    // Solo intentar leer window.location.href en entorno web real.
    const webUrl =
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      typeof window.location !== "undefined"
        ? window.location.href
        : null;

    const currentUrl = url || webUrl;

    if (currentUrl && !processedUrlRef.current) {
      processedUrlRef.current = currentUrl;
      CloudAPI.setSessionFromUrl(currentUrl)
        .catch((error: any) => {
          console.error("[ResetPassword] Error al procesar URL actual:", error);
          showInvalidLinkAlert();
        })
        .finally(() => {
          if (isMounted) {
            setResolvingLink(false);
          }
        });
    } else if (!processedUrlRef.current) {
      // No hay URL disponible aún: intentar obtener la URL inicial del sistema
      hydrateInitialUrl();
    } else {
      // URL ya procesada previamente, no bloquear la pantalla
      if (isMounted) setResolvingLink(false);
    }

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [url, router]);

  const handleResetPassword = async () => {
    console.log(
      "[ResetPassword] Botón presionado. Password length:",
      password.length,
      "Confirm length:",
      confirmPassword.length,
    );
    if (!password) {
      console.log("[ResetPassword] Error: Falta ingresar contraseña");
      Alert.alert("Error", "Por favor ingresa tu nueva contraseña");
      return;
    }

    if (password !== confirmPassword) {
      console.log("[ResetPassword] Error: Las contraseñas no coinciden");
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      console.log("[ResetPassword] Error: Contraseña muy corta");
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      console.log("[ResetPassword] Llamando a CloudAPI.updatePassword...");
      await CloudAPI.updatePassword(password);
      console.log("[ResetPassword] Contraseña actualizada con éxito");
      Alert.alert(
        "Contraseña Actualizada",
        "Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.",
        [{ text: "Aceptar", onPress: () => router.replace("/login") }],
      );
    } catch (error: any) {
      console.error("[ResetPassword] Error en actualización:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {resolvingLink ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.loadingText}>
            Cargando enlace de recuperación...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/login")}
            >
              <Ionicons name="close" size={28} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Nueva Contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu nueva contraseña para actualizar el acceso a tu
                cuenta.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Nueva Contraseña"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
              <Input
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />

              <View style={styles.spacer} />

              <Button
                title="Restablecer Contraseña"
                onPress={handleResetPassword}
                loading={loading}
              />
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: Colors.dark.textMuted,
    fontSize: 15,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    width: "100%",
  },
  spacer: {
    height: 16,
  },
});
