import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Colors } from '../constants/Colors';
import { supabase } from '../services/supabase';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)');
      }
    };
    checkUser();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Presu</Text>
          <Text style={styles.subtitle}>Ordena tus finanzas inteligentemente</Text>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Comenzar" 
            onPress={() => router.push('/login')} 
            style={styles.button}
          />
          <Button 
            title="Ya tengo una cuenta" 
            variant="text" 
            onPress={() => router.push('/login')} 
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    paddingBottom: 20,
  },
  button: {
    marginBottom: 8,
  },
});
