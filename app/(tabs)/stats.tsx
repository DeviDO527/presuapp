import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PieChart } from 'react-native-gifted-charts';
import { CloudAPI } from '../../services/api';
import { Transaction } from '../../components/ui/TransactionItem';
import { useFocusEffect } from 'expo-router';

const CATEGORY_COLORS: Record<string, string> = {
  'Comida': '#FF6B6B',
  'Transporte': '#4D96FF',
  'Renta': '#6BCB77',
  'Compras': '#FFD93D',
  'Ocio': '#9D4EDD',
  'Salud': '#F05454',
  'Servicios': '#38E54D',
  'Otros': '#9CA3AF',
};

export default function StatsScreen() {
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

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  // Group by category
  const grouped = expenses.reduce((acc, curr) => {
    acc[curr.title] = (acc[curr.title] || 0) + Math.abs(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(grouped).map(key => ({
    value: grouped[key],
    color: CATEGORY_COLORS[key] || CATEGORY_COLORS['Otros'],
    text: `${((grouped[key] / totalExpense) * 100).toFixed(0)}%`,
    label: key
  })).sort((a, b) => b.value - a.value);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Estadísticas de Gastos</Text>

        {totalExpense === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay gastos registrados aún.</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                donut
                showText
                textColor="white"
                radius={120}
                innerRadius={70}
                innerCircleColor={Colors.dark.background}
                centerLabelComponent={() => {
                  return (
                    <View style={styles.centerLabel}>
                      <Text style={styles.centerTotal}>Total</Text>
                      <Text style={styles.centerAmount}>${totalExpense.toFixed(0)}</Text>
                    </View>
                  );
                }}
              />
            </View>

            <View style={styles.legendContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.legendValue}>${item.value.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTotal: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  centerAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  legendContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  legendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: Colors.dark.textMuted,
    fontSize: 16,
  }
});
