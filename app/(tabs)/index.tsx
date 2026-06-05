import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Transaction,
    TransactionItem,
} from "../../components/ui/TransactionItem";
import { Colors } from "../../constants/Colors";
import { Budget, CloudAPI } from "../../services/api";
import { supabase } from "../../services/supabase";

// Default categories with icons and colors
const CATEGORIES_META: Record<string, { icon: string; color: string }> = {
  Comida: { icon: "restaurant", color: Colors.dark.tint },
  Transporte: { icon: "car", color: Colors.dark.tint },
  Renta: { icon: "home", color: Colors.dark.tint },
  Compras: { icon: "cart", color: Colors.dark.tint },
  Ocio: { icon: "game-controller", color: Colors.dark.warning },
  Salud: { icon: "medkit", color: Colors.dark.danger },
  Servicios: { icon: "flash", color: Colors.dark.tint },
  Otros: { icon: "ellipsis-horizontal", color: Colors.dark.textMuted },
};

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [userName, setUserName] = useState("Usuario");
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(
          user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Usuario",
        );
      }
      const [txs, bdgts] = await Promise.all([
        CloudAPI.getTransactions(),
        CloudAPI.getBudgets(),
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
    }, []),
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  // Calculate spent per category
  const spentByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, curr) => {
        acc[curr.title] = (acc[curr.title] || 0) + Math.abs(curr.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

  // Combine with budgets
  // If user hasn't set any budgets, we could show default ones or just show what's spent
  const budgetList =
    budgets.length > 0
      ? budgets.map((b) => ({
          name: b.category_id,
          budget: Number(b.amount),
          spent: spentByCategory[b.category_id] || 0,
        }))
      : [
          // Default mock budgets if empty
          {
            name: "Comida",
            budget: 600,
            spent: spentByCategory["Comida"] || 0,
          },
          {
            name: "Transporte",
            budget: 200,
            spent: spentByCategory["Transporte"] || 0,
          },
          { name: "Ocio", budget: 300, spent: spentByCategory["Ocio"] || 0 },
        ];

  // Últimas 10 transacciones como notificaciones
  const notifications = transactions.slice(0, 10).map((t) => ({
    id: t.id,
    title: t.type === "income" ? `Ingreso registrado` : `Gasto registrado`,
    body: `${t.title} · $${Math.abs(t.amount).toFixed(2)}`,
    date: t.date,
    isIncome: t.type === "income",
    icon: t.icon,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Panel de Notificaciones */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.notifOverlay}>
          <View style={styles.notifPanel}>
            <View style={styles.notifHandle} />
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notificaciones</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.notifCloseBtn}
              >
                <Ionicons name="close" size={22} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.notifEmpty}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={40}
                    color={Colors.dark.textMuted}
                  />
                  <Text style={styles.notifEmptyText}>
                    No tienes notificaciones aún
                  </Text>
                </View>
              ) : (
                notifications.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    style={styles.notifItem}
                    onPress={() => {
                      setShowNotifications(false);
                      router.push(`/transaction/${notif.id}`);
                    }}
                  >
                    <View
                      style={[
                        styles.notifIconWrapper,
                        {
                          backgroundColor: notif.isIncome
                            ? "rgba(12, 221, 123, 0.15)"
                            : "rgba(240, 82, 82, 0.15)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={notif.isIncome ? "arrow-down" : "arrow-up"}
                        size={18}
                        color={
                          notif.isIncome
                            ? Colors.dark.success
                            : Colors.dark.danger
                        }
                      />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifItemTitle}>{notif.title}</Text>
                      <Text style={styles.notifItemBody}>{notif.body}</Text>
                      <Text style={styles.notifItemDate}>{notif.date}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.dark.textMuted}
                    />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>BIENVENIDO</Text>
              <Text style={styles.nameText}>Hola, {userName}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => {
              setShowNotifications(true);
              setHasNewNotifications(false);
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.dark.text}
            />
            {hasNewNotifications && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>

          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color={Colors.dark.success}
                />
                <Text style={styles.statLabel}>INGRESOS</Text>
              </View>
              <Text style={styles.statAmount}>${totalIncome.toFixed(2)}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={Colors.dark.danger}
                />
                <Text style={styles.statLabel}>GASTOS</Text>
              </View>
              <Text style={styles.statAmount}>${totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Budget Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resumen de Presupuesto</Text>
          <TouchableOpacity onPress={() => router.push("/new-transaction")}>
            <Text style={styles.seeAll}>Configurar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.budgetList}>
          {budgetList.map((item) => {
            const meta = CATEGORIES_META[item.name] || CATEGORIES_META["Otros"];
            const percent =
              item.budget > 0
                ? Math.min((item.spent / item.budget) * 100, 100)
                : 0;
            const isWarning = percent >= 90;
            const barColor = isWarning ? Colors.dark.warning : meta.color;

            return (
              <View key={item.name} style={styles.budgetItem}>
                <View style={styles.budgetInfo}>
                  <View style={styles.budgetCat}>
                    <Ionicons
                      name={meta.icon as any}
                      size={16}
                      color={barColor}
                    />
                    <Text style={styles.budgetCatName}>{item.name}</Text>
                  </View>
                  <Text style={styles.budgetAmounts}>
                    <Text style={{ color: barColor }}>
                      ${item.spent.toFixed(2)}
                    </Text>{" "}
                    / ${item.budget}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${percent}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.budgetPercent,
                    isWarning && { color: Colors.dark.warning },
                  ]}
                >
                  {percent.toFixed(0)}% UTILIZADO{" "}
                  {isWarning ? "¡CERCA DEL LÍMITE!" : ""}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/wallet")}>
            <Text style={styles.seeAll}>Ver historial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="receipt-outline"
                size={30}
                color={Colors.dark.textMuted}
              />
              <Text style={styles.emptyStateText}>
                Aun no tienes transacciones
              </Text>
              <TouchableOpacity
                style={styles.emptyStateBtn}
                onPress={() => router.push("/new-transaction")}
              >
                <Ionicons name="add" size={18} color="#131B19" />
                <Text style={styles.emptyStateBtnText}>Agregar gasto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            transactions.map((item) => (
              <TransactionItem
                key={item.id}
                transaction={item}
                onPress={(tx) => router.push(`/transaction/${tx.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D6A87C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#000" },
  welcomeText: { fontSize: 10, color: Colors.dark.textMuted, letterSpacing: 1 },
  nameText: { fontSize: 18, fontWeight: "bold", color: Colors.dark.text },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.card,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.tint,
  },
  balanceCard: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: { color: "#131B19", fontSize: 14, fontWeight: "600" },
  balanceAmount: {
    color: "#131B19",
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 8,
  },
  balanceStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statItem: {},
  statIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    color: "#131B19",
    fontSize: 10,
    marginLeft: 4,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statAmount: { color: "#131B19", fontSize: 16, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.dark.text },
  seeAll: { fontSize: 14, color: Colors.dark.tint },
  budgetList: { marginBottom: 32 },
  budgetItem: { marginBottom: 16 },
  budgetInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetCat: { flexDirection: "row", alignItems: "center" },
  budgetCatName: {
    color: Colors.dark.text,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  budgetAmounts: { color: Colors.dark.textMuted, fontSize: 14 },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.dark.card,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  budgetPercent: {
    fontSize: 10,
    color: Colors.dark.tint,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  transactionsList: { paddingBottom: 20 },
  emptyState: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  emptyStateText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
  },
  emptyStateBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.tint,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  emptyStateBtnText: {
    color: "#131B19",
    fontWeight: "700",
    fontSize: 13,
  },

  // Notificaciones Modal
  notifOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  notifPanel: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  notifHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notifTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  notifCloseBtn: {
    padding: 6,
    backgroundColor: Colors.dark.cardSecondary,
    borderRadius: 20,
  },
  notifEmpty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  notifEmptyText: {
    color: Colors.dark.textMuted,
    fontSize: 15,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 14,
  },
  notifIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  notifItemBody: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginBottom: 2,
  },
  notifItemDate: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
});
