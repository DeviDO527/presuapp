import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Transaction } from "../../components/ui/TransactionItem";
import { Colors } from "../../constants/Colors";
import { CloudAPI } from "../../services/api";

const CATEGORY_COLORS: Record<string, string> = {
  Alimentación: "#F59E0B",
  Transporte: "#3B82F6",
  Entretenimiento: "#8B5CF6",
  Salud: "#EF4444",
  Educación: "#06B6D4",
  Ropa: "#EC4899",
  Hogar: "#10B981",
  Otros: "#6B7280",
};

const INCOME_CATEGORY_COLORS: Record<string, string> = {
  Salario: "#0CDD7B",
  Freelance: "#34D399",
  Inversiones: "#6EE7B7",
  Ventas: "#A7F3D0",
  Otros: "#6B7280",
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
    }, []),
  );

  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  const totalExpense = expenses.reduce(
    (acc, curr) => acc + Math.abs(curr.amount),
    0,
  );
  const totalIncome = incomes.reduce(
    (acc, curr) => acc + Math.abs(curr.amount),
    0,
  );
  const netBalance = totalIncome - totalExpense;

  const totalActivity = totalIncome + totalExpense;
  const incomeShare =
    totalActivity > 0 ? (totalIncome / totalActivity) * 100 : 0;
  const expenseShare =
    totalActivity > 0 ? (totalExpense / totalActivity) * 100 : 0;

  const groupedExpenses = expenses.reduce(
    (acc, curr) => {
      acc[curr.title] = (acc[curr.title] || 0) + Math.abs(curr.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const groupedIncomes = incomes.reduce(
    (acc, curr) => {
      acc[curr.title] = (acc[curr.title] || 0) + Math.abs(curr.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const expensePieData = Object.keys(groupedExpenses)
    .map((key) => ({
      value: groupedExpenses[key],
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS["Otros"],
      text:
        totalExpense > 0
          ? `${((groupedExpenses[key] / totalExpense) * 100).toFixed(0)}%`
          : "0%",
      label: key,
    }))
    .sort((a, b) => b.value - a.value);

  const incomePieData = Object.keys(groupedIncomes)
    .map((key) => ({
      value: groupedIncomes[key],
      color: INCOME_CATEGORY_COLORS[key] || INCOME_CATEGORY_COLORS["Otros"],
      text:
        totalIncome > 0
          ? `${((groupedIncomes[key] / totalIncome) * 100).toFixed(0)}%`
          : "0%",
      label: key,
    }))
    .sort((a, b) => b.value - a.value);

  const donutData = [
    {
      value: totalIncome,
      color: Colors.dark.success,
      text: `${incomeShare.toFixed(0)}%`,
    },
    {
      value: totalExpense,
      color: Colors.dark.danger,
      text: `${expenseShare.toFixed(0)}%`,
    },
  ].filter((item) => item.value > 0);

  const renderBreakdown = (
    title: string,
    total: number,
    data: { value: number; color: string; text: string; label: string }[],
    emptyMessage: string,
  ) => (
    <View style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>{title}</Text>
      {total === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={data}
              donut
              showText
              textColor="white"
              radius={120}
              innerRadius={74}
              innerCircleColor={Colors.dark.background}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerTotal}>Total</Text>
                  <Text style={styles.centerAmount}>${total.toFixed(0)}</Text>
                </View>
              )}
            />
          </View>
          <View style={styles.legendContainer}>
            {data.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
                <Text style={styles.legendValue}>{item.text}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <Text style={styles.screenTitle}>Estadísticas</Text>

        {/* Resumen de saldo */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.legendLeft}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.dark.success },
                ]}
              />
              <Text style={styles.summaryLabel}>Ingresos</Text>
            </View>
            <Text
              style={[styles.summaryAmount, { color: Colors.dark.success }]}
            >
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={styles.legendLeft}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.dark.danger },
                ]}
              />
              <Text style={styles.summaryLabel}>Gastos</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: Colors.dark.danger }]}>
              ${totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Saldo neto</Text>
            <Text
              style={[
                styles.summaryAmount,
                {
                  color:
                    netBalance >= 0
                      ? Colors.dark.success
                      : Colors.dark.danger,
                },
              ]}
            >
              ${netBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Distribución general (donut) */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Distribución general</Text>
          {totalActivity === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay movimientos registrados aún.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={donutData}
                  donut
                  showText
                  textColor="white"
                  radius={120}
                  innerRadius={74}
                  innerCircleColor={Colors.dark.background}
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text style={styles.centerTotal}>Total</Text>
                      <Text style={styles.centerAmount}>
                        ${totalActivity.toFixed(0)}
                      </Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: Colors.dark.success },
                      ]}
                    />
                    <Text style={styles.legendLabel}>Ingresos</Text>
                  </View>
                  <Text style={styles.legendValue}>
                    {incomeShare.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: Colors.dark.danger },
                      ]}
                    />
                    <Text style={styles.legendLabel}>Gastos</Text>
                  </View>
                  <Text style={styles.legendValue}>
                    {expenseShare.toFixed(0)}%
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Desglose por categoría: Gastos */}
        {renderBreakdown(
          "Desglose de Gastos",
          totalExpense,
          expensePieData,
          "No hay gastos registrados aún.",
        )}

        {/* Desglose por categoría: Ingresos */}
        {renderBreakdown(
          "Desglose de Ingresos",
          totalIncome,
          incomePieData,
          "No hay ingresos registrados aún.",
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.dark.textMuted,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 4,
  },
  breakdownCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  centerLabel: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerTotal: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  centerAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  legendContainer: {
    backgroundColor: Colors.dark.cardSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendLabel: {
    fontSize: 15,
    color: Colors.dark.text,
  },
  legendValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    padding: 18,
    backgroundColor: Colors.dark.cardSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  emptyText: {
    color: Colors.dark.textMuted,
    fontSize: 15,
  },
});
