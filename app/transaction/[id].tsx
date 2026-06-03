import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { CloudAPI } from '../../services/api';

const CATEGORIES = [
  { id: 'comida', name: 'Comida', icon: 'restaurant' },
  { id: 'transporte', name: 'Transporte', icon: 'car' },
  { id: 'renta', name: 'Renta', icon: 'home' },
  { id: 'compras', name: 'Compras', icon: 'cart' },
  { id: 'ocio', name: 'Ocio', icon: 'game-controller' },
  { id: 'salud', name: 'Salud', icon: 'medkit' },
  { id: 'servicios', name: 'Servicios', icon: 'flash' },
  { id: 'otros', name: 'Otros', icon: 'ellipsis-horizontal' },
];

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCat, setSelectedCat] = useState('comida');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // We would fetch the actual transaction details here if not passed,
    // but for simplicity we assume the user just wants to edit amount/type
    // Alternatively, we could fetch it via API
    const loadTransaction = async () => {
      // In a real app we'd fetch transaction by ID here
    };
    loadTransaction();
  }, [id]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    try {
      setLoading(true);
      const category = CATEGORIES.find(c => c.id === selectedCat);
      await CloudAPI.updateTransaction(id as string, {
        title: category?.name || 'Transacción',
        amount: type === 'expense' ? -Number(amount) : Number(amount),
        type: type,
        icon: category?.icon as any || 'cash-outline',
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Eliminar Transacción', '¿Estás seguro de que deseas eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await CloudAPI.deleteTransaction(id as string);
            router.back();
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo eliminar la transacción');
          } finally {
            setIsDeleting(false);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Transacción</Text>
        <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
          <Ionicons name="trash-outline" size={24} color={Colors.dark.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Ingreso</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>MONTO</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={[styles.currencySymbol, { color: type === 'expense' ? Colors.dark.danger : Colors.dark.success }]}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={Colors.dark.textMuted}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>CATEGORÍA</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat.id;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <View style={[styles.categoryIcon, isSelected && styles.categoryIconActive]}>
                  <Ionicons 
                    name={cat.icon as any} 
                    size={24} 
                    color={isSelected ? '#131B19' : Colors.dark.icon} 
                  />
                </View>
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Button 
          title="Actualizar Transacción" 
          onPress={handleSave} 
          loading={loading}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  closeButton: { padding: 8, marginLeft: -8 },
  headerTitle: { color: Colors.dark.text, fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 24 },
  typeSelector: { flexDirection: 'row', backgroundColor: Colors.dark.card, borderRadius: 12, padding: 4, marginBottom: 32 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  typeBtnActiveExpense: { backgroundColor: Colors.dark.danger },
  typeBtnActiveIncome: { backgroundColor: Colors.dark.success },
  typeText: { color: Colors.dark.textMuted, fontWeight: 'bold' },
  typeTextActive: { color: '#000' },
  amountContainer: { alignItems: 'center', marginBottom: 32 },
  amountLabel: { color: Colors.dark.textMuted, fontSize: 14, fontWeight: 'bold', letterSpacing: 2, marginBottom: 16 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.dark.card, paddingBottom: 8 },
  currencySymbol: { fontSize: 48, fontWeight: 'bold', marginRight: 12 },
  amountInput: { fontSize: 56, fontWeight: 'bold', color: Colors.dark.text, minWidth: 150 },
  sectionTitle: { color: Colors.dark.textMuted, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  categoryItem: { width: '23%', alignItems: 'center', marginBottom: 16, backgroundColor: Colors.dark.card, paddingVertical: 12, borderRadius: 16 },
  categoryItemActive: { backgroundColor: 'rgba(12, 221, 123, 0.1)', borderColor: Colors.dark.tint, borderWidth: 1 },
  categoryIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.dark.cardSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryIconActive: { backgroundColor: Colors.dark.tint },
  categoryText: { color: Colors.dark.textMuted, fontSize: 10 },
  categoryTextActive: { color: Colors.dark.tint, fontWeight: 'bold' },
  saveBtn: { marginTop: 20, marginBottom: 40 },
});
