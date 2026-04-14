/**
 * MarketplaceScreen.tsx
 * Feed principal do ReUse — lista de itens disponíveis para doação, venda e troca.
 *
 * UI/UX mobile aplicados:
 *  - Barra de busca com debounce
 *  - Chips de categorias com scroll horizontal
 *  - FlatList em 2 colunas com skeleton loading
 *  - Pull to refresh
 *  - Estado vazio ilustrado
 *  - Badge de notificação no ícone de sino
 *  - Cards com tag de tipo (doação / venda / troca) e badge "Destaque"
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  Dimensions,
  ListRenderItem,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "../navigation/types";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { CATEGORIES, MOCK_ITEMS, type MarketItem } from "../data/mockData";
import { getFavorites } from "../services/storage";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Marketplace">,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = (SCREEN_W - 48) / 2;

// ─── Componente de Skeleton ────────────────────────────────────────────────────
function SkeletonCard() {
  const opacity = useSharedValue(0.4);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    const interval = setInterval(() => {
      opacity.value = withTiming(0.4, { duration: 600 });
      setTimeout(() => { opacity.value = withTiming(1, { duration: 600 }); }, 600);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, animStyle]}>
      <View style={styles.skeletonImage} />
      <View style={{ padding: 10 }}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSub} />
        <View style={styles.skeletonPrice} />
      </View>
    </Animated.View>
  );
}

// ─── Componente de Card do Item ────────────────────────────────────────────────
function ItemCard({
  item,
  index,
  isFav,
  onPress,
}: {
  item: MarketItem;
  index: number;
  isFav: boolean;
  onPress: () => void;
}) {
  const TYPE_CONFIG = {
    doação: { color: "#16A34A", bg: "#DCFCE7", label: "Doação" },
    venda:  { color: "#2563EB", bg: "#DBEAFE", label: "Venda" },
    troca:  { color: "#7C3AED", bg: "#EDE9FE", label: "Troca" },
  };
  const typeConf = TYPE_CONFIG[item.type];

  return (
    <Animated.View entering={ZoomIn.delay(index * 60).duration(350).springify().damping(14)}>
      <Pressable
        style={({ pressed }) => [styles.itemCard, pressed && { opacity: 0.85 }]}
        onPress={onPress}
      >
        {/* Imagem / preview */}
        <View style={[styles.itemImageWrap, { backgroundColor: item.bgColor }]}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>⭐ Destaque</Text>
            </View>
          )}
          {isFav && (
            <View style={styles.favBadge}>
              <Text style={{ fontSize: 12 }}>❤️</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.itemInfo}>
          {/* Tag de tipo */}
          <View style={[styles.typePill, { backgroundColor: typeConf.bg }]}>
            <Text style={[styles.typePillText, { color: typeConf.color }]}>
              {typeConf.label}
            </Text>
          </View>

          <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>

          <Text style={styles.itemLocation} numberOfLines={1}>
            📍 {item.location}
          </Text>

          {/* Preço / tipo */}
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>
              {item.type === "doação" ? "Grátis" : `R$ ${item.price.toLocaleString("pt-BR")}`}
            </Text>
            <Text style={styles.itemCondition}>{item.condition}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Tela Principal ────────────────────────────────────────────────────────────
export function MarketplaceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    // Simula carregamento inicial
    const t = setTimeout(() => setLoading(false), 1000);
    loadFavorites();
    return () => clearTimeout(t);
  }, []);

  async function loadFavorites() {
    const favs = await getFavorites();
    setFavorites(favs);
  }

  function handleSearchChange(text: string) {
    setSearchText(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(text), 300);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  // Filtragem dos itens
  const filteredItems = MOCK_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      !debouncedSearch ||
      item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderItem: ListRenderItem<MarketItem> = ({ item, index }) => (
    <View style={{ width: CARD_W, marginBottom: 12 }}>
      <ItemCard
        item={item}
        index={index}
        isFav={favorites.includes(item.id)}
        onPress={() =>
          (navigation as any).navigate("ItemDetail", { itemId: item.id })
        }
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Olá! 👋</Text>
            <Text style={styles.headerTitle}>O que você busca hoje?</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => (navigation as any).navigate("Notifications")}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Barra de busca */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar itens, categorias..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(""); setDebouncedSearch(""); }}>
              <Text style={{ fontSize: 18, color: "#94A3B8" }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Categorias */}
      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.categoriesList}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                item.id === selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={styles.categoryChipEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.categoryChipLabel,
                  item.id === selectedCategory && styles.categoryChipLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </Animated.View>

      {/* Contagem */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {loading ? "Carregando..." : `${filteredItems.length} itens encontrados`}
        </Text>
        {!loading && filteredItems.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.filterBtn}>Filtrar ⬇</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Grid de itens */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : filteredItems.length === 0 ? (
        // Estado vazio
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
          <Text style={styles.emptySub}>
            Tente outra categoria ou termo de busca.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0D5C3D"
              colors={["#0D5C3D"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF9" },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerGreeting: { fontSize: 13, color: "#64748B" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginTop: 2 },
  notifBtn: { position: "relative", padding: 4 },
  notifIcon: { fontSize: 24 },
  notifBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notifBadgeText: { fontSize: 9, fontWeight: "800", color: "#FFFFFF" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 15, color: "#0F172A" },

  // Categorias
  categoriesList: { backgroundColor: "#FFFFFF" },
  categoriesContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "#F8FAF9",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#0D5C3D",
    borderColor: "#0D5C3D",
  },
  categoryChipEmoji: { fontSize: 16 },
  categoryChipLabel: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  categoryChipLabelActive: { color: "#FFFFFF" },

  // Contagem
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: { fontSize: 13, color: "#64748B" },
  filterBtn: { fontSize: 13, color: "#0D5C3D", fontWeight: "600" },

  // Skeletons
  skeletonGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 12 },
  skeletonCard: {
    width: CARD_W,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  skeletonImage: { width: "100%", height: 130, backgroundColor: "#E5E7EB" },
  skeletonTitle: { height: 12, backgroundColor: "#E5E7EB", borderRadius: 6, marginBottom: 6 },
  skeletonSub: { height: 10, backgroundColor: "#F1F5F9", borderRadius: 6, width: "70%", marginBottom: 8 },
  skeletonPrice: { height: 14, backgroundColor: "#E5E7EB", borderRadius: 6, width: "40%" },

  // Lista
  listContent: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 },

  // Card
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImageWrap: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  itemEmoji: { fontSize: 52 },
  featuredBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  featuredBadgeText: { fontSize: 10, fontWeight: "600", color: "#92400E" },
  favBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { padding: 10 },
  typePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    marginBottom: 6,
  },
  typePillText: { fontSize: 10, fontWeight: "700" },
  itemTitle: { fontSize: 13, fontWeight: "700", color: "#0F172A", lineHeight: 18, marginBottom: 4 },
  itemLocation: { fontSize: 11, color: "#94A3B8", marginBottom: 6 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemPrice: { fontSize: 14, fontWeight: "800", color: "#0D5C3D" },
  itemCondition: {
    fontSize: 10,
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // Estado vazio
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20 },
});
