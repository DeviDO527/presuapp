import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Colors } from '../constants/Colors';
import { CloudAPI } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await CloudAPI.login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia Sesión para continuar</Text>
        </View>

        <View style={styles.form}>
          <Input 
            placeholder="Usuario / Correo electrónico"
            icon="person-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input 
            placeholder="Contraseña"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <Button 
            title="Iniciar Sesión" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Regístrate</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textMuted,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: Colors.dark.tint,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
  },
  footerText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
  },
  registerText: {
    color: Colors.dark.tint,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
