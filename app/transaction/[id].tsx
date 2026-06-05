import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";
import { CloudAPI } from "../../services/api";

const EXPENSE_CATEGORIES = [
  { id: "comida", name: "Comida", icon: "restaurant" },
  { id: "transporte", name: "Transporte", icon: "car" },
  { id: "renta", name: "Renta", icon: "home" },
  { id: "compras", name: "Compras", icon: "cart" },
  { id: "ocio", name: "Ocio", icon: "game-controller" },
  { id: "salud", name: "Salud", icon: "medkit" },
  { id: "servicios", name: "Servicios", icon: "flash" },
  { id: "otros", name: "Otros", icon: "ellipsis-horizontal" },
];

const INCOME_CATEGORIES = [
  { id: "salario", name: "Salario", icon: "briefcase" },
  { id: "freelance", name: "Freelance", icon: "laptop" },
  { id: "ventas", name: "Ventas", icon: "pricetag" },
  { id: "inversiones", name: "Inversiones", icon: "trending-up" },
  { id: "intereses", name: "Intereses", icon: "stats-chart" },
  { id: "regalo", name: "Regalo", icon: "gift" },
  { id: "reembolso", name: "Reembolso", icon: "refresh" },
  { id: "otros_ingresos", name: "Otros", icon: "wallet" },
];

// Wrapper para Alert que funciona tanto en web como en nativo
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const categories = useMemo(
    () => (type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES),
    [type],
  );
  const [selectedCat, setSelectedCat] = useState(EXPENSE_CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!categories.some((c) => c.id === selectedCat)) {
      setSelectedCat(categories[0].id);
    }
  }, [categories, selectedCat]);

  useEffect(() => {
    const loadTransaction = async () => {
      // En una versión futura: cargar datos de la transacción por ID
    };
    loadTransaction();
  }, [id]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    try {
      setLoading(true);
      const category = categories.find((c) => c.id === selectedCat);
      await CloudAPI.updateTransaction(id as string, {
        title: category?.name || "Transacción",
        amount: type === "expense" ? -Number(amount) : Number(amount),
        type: type,
        icon: (category?.icon as any) || "cash-outline",
      });
      router.back();
    } catch (error) {
      console.error(error);
      showAlert("Error", "No se pudo actualizar la transacción");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      setIsDeleting(true);
      await CloudAPI.deleteTransaction(id as string);
      router.back();
    } catch (error) {
      console.error(error);
      showAlert("Error", "No se pudo eliminar la transacción");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal de confirmación de eliminación — funciona en web y nativo */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrapper}>
              <Ionicons
                name="trash-outline"
                size={32}
                color={Colors.dark.danger}
              />
            </View>
            <Text style={styles.modalTitle}>Eliminar Transacción</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción
              no se puede deshacer.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                <Text style={styles.modalDeleteText}>
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Transacción</Text>
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color={Colors.dark.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === "expense" && styles.typeBtnActiveExpense,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.typeText,
                type === "expense" && styles.typeTextActive,
              ]}
            >
              Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === "income" && styles.typeBtnActiveIncome,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.typeText,
                type === "income" && styles.typeTextActive,
              ]}
            >
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>MONTO</Text>
          <View style={styles.amountInputWrapper}>
            <Text
              style={[
                styles.currencySymbol,
                {
                  color:
                    type === "expense"
                      ? Colors.dark.danger
                      : Colors.dark.success,
                },
              ]}
            >
              $
            </Text>
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

        <Text style={styles.sectionTitle}>
          {type === "expense" ? "CATEGORÍA DE GASTO" : "CATEGORÍA DE INGRESO"}
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  isSelected && styles.categoryItemActive,
                ]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    isSelected && styles.categoryIconActive,
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={isSelected ? "#131B19" : Colors.dark.icon}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  closeButton: { padding: 8, marginLeft: -8 },
  deleteButton: { padding: 8, marginRight: -8 },
  headerTitle: { color: Colors.dark.text, fontSize: 18, fontWeight: "bold" },

  // Modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(240, 82, 82, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.dark.cardSecondary,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modalCancelText: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontSize: 15,
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.dark.danger,
    alignItems: "center",
  },
  modalDeleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  // Form
  scrollContent: { padding: 24 },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  typeBtnActiveExpense: { backgroundColor: Colors.dark.danger },
  typeBtnActiveIncome: { backgroundColor: Colors.dark.success },
  typeText: { color: Colors.dark.textMuted, fontWeight: "bold" },
  typeTextActive: { color: "#000" },
  amountContainer: { alignItems: "center", marginBottom: 32 },
  amountLabel: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 16,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.card,
    paddingBottom: 8,
  },
  currencySymbol: { fontSize: 48, fontWeight: "bold", marginRight: 12 },
  amountInput: {
    fontSize: 56,
    fontWeight: "bold",
    color: Colors.dark.text,
    minWidth: 150,
  },
  sectionTitle: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    borderRadius: 16,
  },
  categoryItemActive: {
    backgroundColor: "rgba(12, 221, 123, 0.1)",
    borderColor: Colors.dark.tint,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIconActive: { backgroundColor: Colors.dark.tint },
  categoryText: { color: Colors.dark.textMuted, fontSize: 10 },
  categoryTextActive: { color: Colors.dark.tint, fontWeight: "bold" },
  saveBtn: { marginTop: 20, marginBottom: 40 },
});
