
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Colors } from '../constants/Colors';
import { CloudAPI } from '../services/api';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useURL() || (typeof window !== 'undefined' ? window.location.href : null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);

  useEffect(() => {
    const checkRecoverySession = async () => {
      console.log('[ResetPassword] URL detectado:', url);
      if (url) {
        try {
          console.log('[ResetPassword] Estableciendo sesión desde URL...');
          await CloudAPI.setSessionFromUrl(url);
          console.log('[ResetPassword] Sesión establecida correctamente.');
          setSessionSet(true);
        } catch (error: any) {
          console.error('[ResetPassword] Error al establecer sesión:', error);
          Alert.alert(
            'Sesión Inválida',
            'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.',
            [
              { text: 'Aceptar', onPress: () => router.replace('/forgot-password') }
            ]
          );
        }
      }
    };
    checkRecoverySession();
  }, [url]);

  const handleResetPassword = async () => {
    console.log('[ResetPassword] Botón presionado. Password length:', password.length, 'Confirm length:', confirmPassword.length);
    if (!password) {
      console.log('[ResetPassword] Error: Falta ingresar contraseña');
      Alert.alert('Error', 'Por favor ingresa tu nueva contraseña');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[ResetPassword] Error: Las contraseñas no coinciden');
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      console.log('[ResetPassword] Error: Contraseña muy corta');
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      console.log('[ResetPassword] Llamando a CloudAPI.updatePassword...');
      await CloudAPI.updatePassword(password);
      console.log('[ResetPassword] Contraseña actualizada con éxito');
      Alert.alert(
        'Contraseña Actualizada',
        'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.',
        [
          { text: 'Aceptar', onPress: () => router.replace('/login') }
        ]
      );
    } catch (error: any) {
      console.error('[ResetPassword] Error en actualización:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
          <Ionicons name="close" size={28} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nueva Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu nueva contraseña para actualizar el acceso a tu cuenta.
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
  },
  spacer: {
    height: 16,
  },
});
