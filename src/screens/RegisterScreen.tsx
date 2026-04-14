/**
 * RegisterScreen.tsx
 * Tela de cadastro de novos usuários.
 * Salva os dados iniciais do perfil via AsyncStorage e navega para o app principal.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { saveUserProfile } from "../services/storage";
import { SpringPressable } from "../components/AnimatedComponents";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha nome, e-mail e senha.");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Senhas diferentes", "A confirmação de senha não confere.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    // Persiste perfil inicial no AsyncStorage
    await saveUserProfile({
      name: name.trim(),
      email: email.trim(),
      city: city.trim(),
      bio: "",
      avatarUri: null,
      level: 1,
      xp: 100, // bônus de cadastro
      streak: 0,
      itemsListed: 0,
      tradesCompleted: 0,
      donationsGiven: 0,
      createdAt: new Date().toISOString(),
    });

    setLoading(false);
    Alert.alert(
      "Bem-vindo ao ReUse! 🌱",
      `Oi, ${name.trim().split(" ")[0]}! Sua conta foi criada com sucesso.`,
      [{ text: "Começar!", onPress: () => navigation.replace("MainApp") }]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar conta</Text>
          <Text style={styles.headerSub}>
            Junte-se à comunidade ReUse e faça a diferença!
          </Text>
        </Animated.View>

        {/* Card do formulário */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.card}>
          {/* Bônus de cadastro */}
          <View style={styles.bonusBanner}>
            <Text style={styles.bonusEmoji}>🎁</Text>
            <Text style={styles.bonusText}>Ganhe 100 RP só por se cadastrar!</Text>
          </View>

          {/* Nome */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Cidade */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cidade (opcional)</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: São Paulo, SP"
                placeholderTextColor="#94A3B8"
                value={city}
                onChangeText={setCity}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPwd ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={[
              styles.inputWrap,
              confirmPassword && confirmPassword !== password && styles.inputError,
            ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPwd}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              {confirmPassword.length > 0 && (
                <Text style={{ fontSize: 16 }}>
                  {confirmPassword === password ? "✅" : "❌"}
                </Text>
              )}
            </View>
          </View>

          {/* Botão cadastrar */}
          <SpringPressable
            onPress={handleRegister}
            style={[styles.registerButton, loading && { opacity: 0.8 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Criar conta gratuita</Text>
            )}
          </SpringPressable>

          {/* Link login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#F8FAF9" },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: {
    backgroundColor: "#0D5C3D",
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: { marginBottom: 20 },
  backBtnText: { fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  bonusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  bonusEmoji: { fontSize: 22 },
  bonusText: { fontSize: 14, fontWeight: "600", color: "#92400E", flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputError: { borderColor: "#FCA5A5", backgroundColor: "#FFF5F5" },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, color: "#0F172A" },
  eyeBtn: { padding: 4 },
  registerButton: {
    backgroundColor: "#0D5C3D",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  registerButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginText: { fontSize: 14, color: "#64748B" },
  loginLink: { fontSize: 14, fontWeight: "700", color: "#0D5C3D" },
});
