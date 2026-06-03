import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { CloudAPI } from '../../services/api';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario');
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await CloudAPI.logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Perfil de {userName}</Text>
      <Button title="Cerrar Sesión" onPress={handleLogout} variant="secondary" style={styles.logoutBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutBtn: {
    width: '100%',
  }
});
