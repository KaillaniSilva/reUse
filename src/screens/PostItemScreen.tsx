/**
 * PostItemScreen.tsx
 * Tela de publicação de novo item no ReUse.
 *
 * Recursos nativos utilizados:
 *  - expo-image-picker:
 *    • launchCameraAsync()        → abre câmera para fotografar o item
 *    • launchImageLibraryAsync()  → abre galeria para selecionar foto existente
 *  - AsyncStorage (via addPostedItem()):
 *    → salva o item publicado localmente
 *
 * UI/UX mobile aplicados:
 *  - ActionSheet para escolher câmera ou galeria
 *  - Preview da foto selecionada com opção de remover
 *  - Seleção de categoria por chips
 *  - Seleção de condição por cards
 *  - Toggle de tipo (doação / venda / troca) com preço condicional
 *  - KeyboardAvoidingView para campos de texto
 *  - Validação em tempo real
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "../navigation/types";
import { addPostedItem } from "../services/storage";
import { SpringPressable } from "../components/AnimatedComponents";
import { CATEGORIES } from "../data/mockData";

type Props = BottomTabScreenProps<TabParamList, "PostItem">;

const CONDITIONS = ["Novo", "Excelente", "Bom", "Razoável"] as const;
const TYPES = [
  { value: "doação", label: "Doação", emoji: "💚", color: "#16A34A", bg: "#DCFCE7" },
  { value: "venda",  label: "Venda",  emoji: "💰", color: "#2563EB", bg: "#DBEAFE" },
  { value: "troca",  label: "Troca",  emoji: "🔄", color: "#7C3AED", bg: "#EDE9FE" },
] as const;

export function PostItemScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // Foto
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<string>("");
  const [itemType, setItemType] = useState<"doação" | "venda" | "troca">("doação");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Câmera ────────────────────────────────────────────────────────────────
  async function openCamera() {
    setShowPhotoModal(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permissão negada",
        "Permita o acesso à câmera nas configurações do dispositivo para fotografar o item."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  // ─── Galeria ───────────────────────────────────────────────────────────────
  async function openGallery() {
    setShowPhotoModal(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permissão negada",
        "Permita o acesso à galeria nas configurações do dispositivo."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  // ─── Publicar ──────────────────────────────────────────────────────────────
  async function handlePublish() {
    if (!title.trim()) {
      Alert.alert("Campo obrigatório", "Dê um título ao seu item.");
      return;
    }
    if (!category) {
      Alert.alert("Campo obrigatório", "Selecione uma categoria.");
      return;
    }
    if (!condition) {
      Alert.alert("Campo obrigatório", "Selecione o estado de conservação.");
      return;
    }
    if (itemType === "venda" && (!price || isNaN(Number(price)) || Number(price) <= 0)) {
      Alert.alert("Preço inválido", "Informe um preço válido para o item.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    await addPostedItem({
      id: `item_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      price: itemType === "venda" ? Number(price) : 0,
      type: itemType,
      imageUri,
      location: "Sua cidade",
      createdAt: new Date().toISOString(),
    });

    setLoading(false);
    Alert.alert(
      "Item publicado! 🎉",
      "Seu item já está visível no ReUse. Você ganhou +50 RP!",
      [
        {
          text: "Ver marketplace",
          onPress: () => {
            resetForm();
            navigation.navigate("Marketplace");
          },
        },
      ]
    );
  }

  function resetForm() {
    setImageUri(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setCondition("");
    setItemType("doação");
    setPrice("");
  }

  const categoriesFiltered = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Publicar Item</Text>
          <Text style={styles.headerSub}>Dê nova vida ao que você não usa</Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Foto do item ──────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.sectionTitle}>Foto do item</Text>
            <TouchableOpacity
              style={[styles.photoArea, imageUri && styles.photoAreaFilled]}
              onPress={() => setShowPhotoModal(true)}
              activeOpacity={0.8}
            >
              {imageUri ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={styles.removePhotoBtnText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.changePhotoBtn}
                    onPress={() => setShowPhotoModal(true)}
                  >
                    <Text style={styles.changePhotoBtnText}>📷 Trocar foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderEmoji}>📷</Text>
                  <Text style={styles.photoPlaceholderTitle}>Adicionar foto</Text>
                  <Text style={styles.photoPlaceholderSub}>
                    Câmera ou galeria • Melhora em até 3x as chances de doação/venda
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* ── Tipo ──────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Text style={styles.sectionTitle}>Tipo de anúncio</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeCard,
                    itemType === t.value && {
                      backgroundColor: t.bg,
                      borderColor: t.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setItemType(t.value)}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      itemType === t.value && { color: t.color, fontWeight: "700" },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* ── Título ─────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.sectionTitle}>Título *</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Sofá 3 lugares cinza"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                maxLength={60}
                returnKeyType="next"
              />
              <Text style={styles.charCount}>{title.length}/60</Text>
            </View>
          </Animated.View>

          {/* ── Descrição ─────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(220).duration(500)}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <View style={[styles.inputWrap, styles.textAreaWrap]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva o item: marca, tamanho, cor, estado, motivo da venda/doação..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={400}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { alignSelf: "flex-end" }]}>{description.length}/400</Text>
            </View>
          </Animated.View>

          {/* ── Categoria ─────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(240).duration(500)}>
            <Text style={styles.sectionTitle}>Categoria *</Text>
            <View style={styles.chipsWrap}>
              {categoriesFiltered.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    category === cat.id && styles.chipActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      category === cat.id && styles.chipLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* ── Estado de conservação ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(260).duration(500)}>
            <Text style={styles.sectionTitle}>Estado de conservação *</Text>
            <View style={styles.conditionsRow}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.condCard,
                    condition === cond && styles.condCardActive,
                  ]}
                  onPress={() => setCondition(cond)}
                >
                  <Text style={[styles.condLabel, condition === cond && styles.condLabelActive]}>
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* ── Preço (só para venda) ─────────────────────────────── */}
          {itemType === "venda" && (
            <Animated.View entering={ZoomIn.duration(350)}>
              <Text style={styles.sectionTitle}>Preço (R$) *</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 0 }]}
                  placeholder="0,00"
                  placeholderTextColor="#94A3B8"
                  value={price}
                  onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ""))}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            </Animated.View>
          )}

          {/* ── Dica ambiental ────────────────────────────────────── */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.ecoTip}
          >
            <Text style={styles.ecoEmoji}>🌱</Text>
            <Text style={styles.ecoText}>
              {itemType === "doação"
                ? "Itens doados ganham +300 RP e ajudam o planeta!"
                : itemType === "troca"
                ? "Trocas geram +200 RP e criam conexões na comunidade."
                : "Itens vendidos ganham +50 RP. Boa sorte na venda!"}
            </Text>
          </Animated.View>

          {/* ── Botão publicar ───────────────────────────────────── */}
          <SpringPressable
            onPress={handlePublish}
            style={[styles.publishBtn, loading && { opacity: 0.7 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.publishBtnText}>Publicar agora</Text>
                <Text style={styles.publishBtnSub}>
                  {itemType === "doação" ? "• Grátis • +300 RP" : itemType === "troca" ? "• +200 RP" : "• +50 RP"}
                </Text>
              </>
            )}
          </SpringPressable>
        </ScrollView>
      </View>

      {/* ── Modal: câmera ou galeria ──────────────────────────────── */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowPhotoModal(false)}
          activeOpacity={1}
        >
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={[styles.modalSheet, { paddingBottom: 20 + insets.bottom }]}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Adicionar foto do item</Text>
            <Text style={styles.modalSub}>Fotos de qualidade aumentam as chances de sucesso!</Text>

            <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
              <View style={styles.modalOptionIcon}>
                <Text style={{ fontSize: 28 }}>📷</Text>
              </View>
              <View style={styles.modalOptionInfo}>
                <Text style={styles.modalOptionTitle}>Tirar foto agora</Text>
                <Text style={styles.modalOptionSub}>Use a câmera do seu dispositivo</Text>
              </View>
              <Text style={styles.modalOptionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={openGallery}>
              <View style={styles.modalOptionIcon}>
                <Text style={{ fontSize: 28 }}>🖼️</Text>
              </View>
              <View style={styles.modalOptionInfo}>
                <Text style={styles.modalOptionTitle}>Escolher da galeria</Text>
                <Text style={styles.modalOptionSub}>Selecione uma foto já existente</Text>
              </View>
              <Text style={styles.modalOptionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF9" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerSub: { fontSize: 13, color: "#64748B", marginTop: 2 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 10, marginTop: 20 },

  // Foto
  photoArea: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "#F8FAF9",
  },
  photoAreaFilled: { borderStyle: "solid", borderColor: "#0D5C3D" },
  photoPreviewWrap: { flex: 1, position: "relative" },
  photoPreview: { width: "100%", height: "100%" },
  removePhotoBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  changePhotoBtn: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -55 }],
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changePhotoBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  photoPlaceholderEmoji: { fontSize: 44 },
  photoPlaceholderTitle: { fontSize: 16, fontWeight: "700", color: "#0D5C3D" },
  photoPlaceholderSub: { fontSize: 12, color: "#94A3B8", textAlign: "center", maxWidth: 240 },

  // Tipos
  typeRow: { flexDirection: "row", gap: 10 },
  typeCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  typeEmoji: { fontSize: 24 },
  typeLabel: { fontSize: 13, fontWeight: "500", color: "#64748B" },

  // Inputs
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    minHeight: 52,
  },
  textAreaWrap: { alignItems: "flex-start", paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: "#0F172A", paddingLeft: 4 },
  textArea: { height: 100, paddingTop: 0 },
  charCount: { fontSize: 11, color: "#94A3B8" },
  currencySymbol: { fontSize: 16, fontWeight: "700", color: "#0D5C3D", marginRight: 8 },

  // Chips de categoria
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    gap: 5,
  },
  chipActive: { backgroundColor: "#0D5C3D", borderColor: "#0D5C3D" },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 13, fontWeight: "500", color: "#64748B" },
  chipLabelActive: { color: "#FFFFFF", fontWeight: "700" },

  // Condições
  conditionsRow: { flexDirection: "row", gap: 10 },
  condCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  condCardActive: { backgroundColor: "#F0FDF4", borderColor: "#0D5C3D" },
  condLabel: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  condLabelActive: { color: "#0D5C3D" },

  // Eco tip
  ecoTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  ecoEmoji: { fontSize: 22 },
  ecoText: { flex: 1, fontSize: 13, color: "#166534", fontWeight: "500", lineHeight: 18 },

  // Botão publicar
  publishBtn: {
    backgroundColor: "#0D5C3D",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 24,
    gap: 2,
  },
  publishBtnText: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
  publishBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.75)" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#64748B", marginBottom: 12 },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalOptionInfo: { flex: 1 },
  modalOptionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  modalOptionSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  modalOptionArrow: { fontSize: 18, color: "#0D5C3D", fontWeight: "700" },
  modalCancel: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    marginTop: 4,
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: "#64748B" },
});
