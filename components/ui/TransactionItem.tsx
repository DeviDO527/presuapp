import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  icon: keyof typeof Ionicons.glyphMap;
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.success : colors.danger;
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress && onPress(transaction)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.cardSecondary }]}>
        <Ionicons name={transaction.icon} size={24} color={colors.tint} />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{transaction.title}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{transaction.date}</Text>
      </View>
      
      <Text style={[styles.amount, { color: amountColor }]}>
        {amountPrefix}${Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
