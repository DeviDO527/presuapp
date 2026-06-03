import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Transaction, TransactionItem } from '../../components/ui/TransactionItem';
import { CloudAPI, Budget } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useFocusEffect, useRouter } from 'expo-router';

// Default categories with icons and colors
const CATEGORIES_META: Record<string, { icon: string, color: string }> = {
  'Comida': { icon: 'restaurant', color: Colors.dark.tint },
  'Transporte': { icon: 'car', color: Colors.dark.tint },
  'Renta': { icon: 'home', color: Colors.dark.tint },
  'Compras': { icon: 'cart', color: Colors.dark.tint },
  'Ocio': { icon: 'game-controller', color: Colors.dark.warning },
  'Salud': { icon: 'medkit', color: Colors.dark.danger },
  'Servicios': { icon: 'flash', color: Colors.dark.tint },
  'Otros': { icon: 'ellipsis-horizontal', color: Colors.dark.textMuted },
};

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [userName, setUserName] = useState('Usuario');
  
  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario');
      }
      const [txs, bdgts] = await Promise.all([
        CloudAPI.getTransactions(),
        CloudAPI.getBudgets()
      ]);
      setTransactions(txs);
      setBudgets(bdgts);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  // Calculate spent per category
  const spentByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.title] = (acc[curr.title] || 0) + Math.abs(curr.amount);
      return acc;
    }, {} as Record<string, number>);

  // Combine with budgets
  // If user hasn't set any budgets, we could show default ones or just show what's spent
  const budgetList = budgets.length > 0 ? budgets.map(b => ({
    name: b.category_id,
    budget: Number(b.amount),
    spent: spentByCategory[b.category_id] || 0
  })) : [
    // Default mock budgets if empty
    { name: 'Comida', budget: 600, spent: spentByCategory['Comida'] || 0 },
    { name: 'Transporte', budget: 200, spent: spentByCategory['Transporte'] || 0 },
    { name: 'Ocio', budget: 300, spent: spentByCategory['Ocio'] || 0 }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>BIENVENIDO</Text>
              <Text style={styles.nameText}>Hola, {userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.dark.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="arrow-down" size={16} color={Colors.dark.success} />
                <Text style={styles.statLabel}>INGRESOS</Text>
              </View>
              <Text style={styles.statAmount}>${totalIncome.toFixed(2)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="arrow-up" size={16} color={Colors.dark.danger} />
                <Text style={styles.statLabel}>GASTOS</Text>
              </View>
              <Text style={styles.statAmount}>${totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Budget Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resumen de Presupuesto</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Configurar</Text></TouchableOpacity>
        </View>

        <View style={styles.budgetList}>
          {budgetList.map(item => {
            const meta = CATEGORIES_META[item.name] || CATEGORIES_META['Otros'];
            const percent = item.budget > 0 ? Math.min((item.spent / item.budget) * 100, 100) : 0;
            const isWarning = percent >= 90;
            const barColor = isWarning ? Colors.dark.warning : meta.color;

            return (
              <View key={item.name} style={styles.budgetItem}>
                <View style={styles.budgetInfo}>
                  <View style={styles.budgetCat}>
                    <Ionicons name={meta.icon as any} size={16} color={barColor} />
                    <Text style={styles.budgetCatName}>{item.name}</Text>
                  </View>
                  <Text style={styles.budgetAmounts}>
                    <Text style={{color: barColor}}>${item.spent.toFixed(2)}</Text> / ${item.budget}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={[styles.budgetPercent, isWarning && { color: Colors.dark.warning }]}>
                  {percent.toFixed(0)}% UTILIZADO {isWarning ? '¡CERCA DEL LÍMITE!' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Ver historial</Text></TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map(item => (
            <TransactionItem 
              key={item.id} 
              transaction={item} 
              onPress={(tx) => router.push(`/transaction/${tx.id}`)}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D6A87C', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  welcomeText: { fontSize: 10, color: Colors.dark.textMuted, letterSpacing: 1 },
  nameText: { fontSize: 18, fontWeight: 'bold', color: Colors.dark.text },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.dark.card, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.tint },
  balanceCard: { backgroundColor: Colors.dark.tint, borderRadius: 24, padding: 24, marginBottom: 32, shadowColor: Colors.dark.tint, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  balanceLabel: { color: '#131B19', fontSize: 14, fontWeight: '600' },
  balanceAmount: { color: '#131B19', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  balanceStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  statItem: {},
  statIconContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statLabel: { color: '#131B19', fontSize: 10, marginLeft: 4, fontWeight: '700', letterSpacing: 1 },
  statAmount: { color: '#131B19', fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.dark.text },
  seeAll: { fontSize: 14, color: Colors.dark.tint },
  budgetList: { marginBottom: 32 },
  budgetItem: { marginBottom: 16 },
  budgetInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetCat: { flexDirection: 'row', alignItems: 'center' },
  budgetCatName: { color: Colors.dark.text, marginLeft: 8, fontSize: 14, fontWeight: '500' },
  budgetAmounts: { color: Colors.dark.textMuted, fontSize: 14 },
  progressBarBg: { height: 6, backgroundColor: Colors.dark.card, borderRadius: 3, marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  budgetPercent: { fontSize: 10, color: Colors.dark.tint, fontWeight: 'bold', letterSpacing: 0.5 },
  transactionsList: { paddingBottom: 20 },
});
