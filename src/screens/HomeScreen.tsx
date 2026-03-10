import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { cardShadow } from "../theme/shadows";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const CONTENT_WIDTH_PERCENT = "80%";
const SECTION_GAP = 48;
const CARD_GAP = 20;

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

/** Card com emoji no topo, título e descrição */
function FeatureCard({
  icon,
  title,
  description,
  style,
}: {
  icon: string;
  title: string;
  description: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.featureCard, style]}>
      <View style={[styles.featureCardInner, cardShadow]}>
        <View style={styles.featureCardIcon}>
          <Text style={styles.featureCardEmoji}>{icon}</Text>
        </View>
        <Text style={styles.featureCardTitle}>{title}</Text>
        <Text style={styles.featureCardDesc}>{description}</Text>
      </View>
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 600;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner: 100% da largura, escrita centralizada */}
        <View style={styles.banner}>
          <View style={styles.bannerInner}>
            <Text style={styles.bannerTitle}>
              Economia sustentável e consumo consciente
            </Text>
            <Text style={styles.bannerSub}>
              Conectamos quem quer dar nova vida a itens usados e quem busca
              qualidade sem comprar novo.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("About")}
              style={({ pressed }) => [
                styles.bannerButton,
                pressed && styles.bannerButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Saber mais"
            >
              <Text style={styles.bannerButtonText}>Saber mais</Text>
            </Pressable>
          </View>
        </View>

        {/* Conteúdo: 80% da largura, centralizado */}
        <View style={styles.contentWrap}>
          {/* O problema — um bloco único */}
          <View style={styles.section}>
            <SectionTitle title="O problema que enfrentamos" />
            <View style={[styles.card, cardShadow]}>
              <Text style={styles.body}>
                O consumo excessivo e o descarte precoce geram impacto ambiental
                e social. No Brasil, milhões de toneladas de roupas, móveis e
                eletrônicos vão para o lixo todos os anos, enquanto muitas
                pessoas poderiam reutilizá-los.
              </Text>
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>
                  Exemplo: só de resíduos têxteis, são descartadas mais de 170 mil
                  toneladas por ano. A maior parte poderia ser reutilizada ou
                  reciclada.
                </Text>
              </View>
            </View>
          </View>

          {/* O que você pode reutilizar — grid de cards */}
          <View style={styles.section}>
            <SectionTitle
              title="O que você pode reutilizar no ReUse"
              subtitle="Dê nova vida ao que já existe."
            />
            <View style={[styles.cardGrid, isNarrow && styles.cardGridNarrow]}>
              {[
                {
                  icon: "👕",
                  title: "Roupas e calçados",
                  desc: "Camisetas, casacos, sapatos em bom estado para doar ou vender.",
                },
                {
                  icon: "🛋️",
                  title: "Móveis e decoração",
                  desc: "Sofás, mesas, cadeiras, quadros e itens de decoração.",
                },
                {
                  icon: "📱",
                  title: "Eletrônicos e eletrodomésticos",
                  desc: "Celulares, notebooks, geladeiras, micro-ondas que ainda funcionam.",
                },
                {
                  icon: "📚",
                  title: "Livros, brinquedos e outros",
                  desc: "Livros, jogos, brinquedos, utensílios de cozinha e muito mais.",
                },
              ].map((item) => (
                <FeatureCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.desc}
                  style={isNarrow ? styles.featureCardFull : undefined}
                />
              ))}
            </View>
          </View>

          {/* Por que usar — grid de cards */}
          <View style={styles.section}>
            <SectionTitle
              title="O que você ganha com o ReUse"
              subtitle="Uma mudança que vai além da economia."
            />
            <View style={[styles.cardGrid, isNarrow && styles.cardGridNarrow]}>
              {[
                {
                  icon: "🌱",
                  title: "Menos impacto no planeta",
                  desc: "Cada item reutilizado significa menos produção nova, menos lixo e menos uso de recursos naturais.",
                },
                {
                  icon: "💰",
                  title: "Economia real",
                  desc: "Quem doa ou vende ganha espaço e dá destino útil; quem busca encontra itens de qualidade por um preço acessível.",
                },
                {
                  icon: "🤝",
                  title: "Comunidade consciente",
                  desc: "Faça parte de uma rede de pessoas que valorizam o consumo responsável e a vida útil dos produtos.",
                },
              ].map((item) => (
                <FeatureCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.desc}
                  style={isNarrow ? styles.featureCardFull : undefined}
                />
              ))}
            </View>
          </View>

          {/* Como funciona em 3 passos */}
          <View style={styles.section}>
            <SectionTitle title="Como funciona em 3 passos" />
            <View style={[styles.card, cardShadow]}>
              {[
                {
                  step: "1",
                  title: "Anuncie ou busque",
                  text: "Cadastre itens que você não usa mais ou pesquise o que precisa.",
                },
                {
                  step: "2",
                  title: "Conecte-se",
                  text: "Combine com outra pessoa da plataforma de forma segura e transparente.",
                },
                {
                  step: "3",
                  title: "Reutilize",
                  text: "Doação, venda ou troca: o item ganha nova vida e você faz a diferença.",
                },
              ].map((item) => (
                <View key={item.step} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{item.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                    <Text style={styles.stepText}>{item.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* CTA final */}
          <View style={styles.ctaBlock}>
            <Pressable
              onPress={() => navigation.navigate("About")}
              style={({ pressed }) => [
                styles.ctaButton,
                cardShadow,
                pressed && styles.ctaPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Saber mais sobre o projeto"
            >
              <Text style={styles.ctaTitle}>Saber mais sobre o projeto</Text>
              <Text style={styles.ctaSub}>Missão, impacto e próximos passos</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingVertical: 32,
    paddingBottom: 56,
    alignItems: "center",
  },
  contentWrap: {
    width: CONTENT_WIDTH_PERCENT,
    alignSelf: "center",
    marginTop: SECTION_GAP,
  },
  banner: {
    width: "100%",
    backgroundColor: "#0D5C3D",
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerInner: {
    alignItems: "center",
    maxWidth: 560,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: "center",
  },
  bannerSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  bannerButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignSelf: "center",
  },
  bannerButtonPressed: { opacity: 0.92 },
  bannerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D5C3D",
  },
  section: {
    marginTop: SECTION_GAP,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569",
    marginBottom: 16,
  },
  highlight: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#0D5C3D",
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D5C3D",
    lineHeight: 20,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -CARD_GAP / 2,
  },
  cardGridNarrow: {},
  featureCard: {
    width: "50%",
    padding: CARD_GAP / 2,
    minWidth: 0,
  },
  featureCardFull: {
    width: "100%",
  },
  featureCardInner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#E8F5F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureCardEmoji: {
    fontSize: 28,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  featureCardDesc: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D5C3D",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  stepText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 20,
  },
  ctaBlock: {
    alignItems: "center",
    marginTop: 56,
  },
  ctaButton: {
    backgroundColor: "#0D5C3D",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 280,
  },
  ctaPressed: { opacity: 0.92 },
  ctaTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ctaSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
});
