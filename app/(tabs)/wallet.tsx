import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CloudAPI } from '../../services/api';
import { Transaction } from '../../components/ui/TransactionItem';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const txs = await CloudAPI.getTransactions();
        setTransactions(txs);
      };
      load();
    }, [])
  );

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mi Cartera</Text>

        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Efectivo Disponible</Text>
          <Text style={styles.cardAmount}>${balance.toFixed(2)}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Actualizado hoy</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Flujo de Caja Mensual</Text>

        <View style={styles.flowContainer}>
          <View style={styles.flowItem}>
            <View style={[styles.flowIcon, { backgroundColor: 'rgba(12, 221, 123, 0.1)' }]}>
              <Ionicons name="arrow-down" size={24} color={Colors.dark.success} />
            </View>
            <View style={styles.flowDetails}>
              <Text style={styles.flowLabel}>Ingresos</Text>
              <Text style={[styles.flowAmount, { color: Colors.dark.success }]}>+${totalIncome.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.flowDivider} />

          <View style={styles.flowItem}>
            <View style={[styles.flowIcon, { backgroundColor: 'rgba(240, 82, 82, 0.1)' }]}>
              <Ionicons name="arrow-up" size={24} color={Colors.dark.danger} />
            </View>
            <View style={styles.flowDetails}>
              <Text style={styles.flowLabel}>Gastos</Text>
              <Text style={[styles.flowAmount, { color: Colors.dark.danger }]}>-${totalExpense.toFixed(2)}</Text>
            </View>
          </View>
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
  scroll: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 32,
    marginTop: 16,
  },
  mainCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardLabel: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  cardAmount: {
    color: Colors.dark.tint,
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  cardFooterText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  flowContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flowDetails: {
    flex: 1,
  },
  flowLabel: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  flowAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  flowDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 16,
    marginLeft: 64, // Align with text
  }
});
