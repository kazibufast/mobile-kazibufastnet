import { API_ENVIRONMENTS, getApiBaseUrl } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

const TOAST_DURATION = 3500;

const config: Record<ToastType, { bg: string; icon: string; color: string }> = {
  success: { bg: "#EAFAF1", icon: "checkmark-circle", color: "#27AE60" },
  error: { bg: "#FDEDEC", icon: "alert-circle", color: "#E74C3C" },
  info: { bg: "#EBF5FB", icon: "information-circle", color: "#3498DB" },
};

// ─── Global toast trigger ─────────────────────────────────────
let _showToast: ((text: string, type?: ToastType) => void) | null = null;

export function showToast(text: string, type: ToastType = "info") {
  if (_showToast) _showToast(text, type);
}

// ─── Toast Provider (mount once in root layout) ───────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((text: string, type: ToastType = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  useEffect(() => {
    _showToast = addToast;
    return () => { _showToast = null; };
  }, [addToast]);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [isDev, setIsDev] = useState(getApiBaseUrl() !== API_ENVIRONMENTS.production);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDev(getApiBaseUrl() !== API_ENVIRONMENTS.production);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isDev && (
        <View style={styles.devBanner}>
          <Ionicons name="bug" size={14} color="#fff" />
          <Text style={styles.devBannerText}>TEST MODE</Text>
        </View>
      )}
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </View>
    </View>
  );
}

// ─── Single toast item with animation ─────────────────────────
function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start();
    }, TOAST_DURATION - 400);

    return () => clearTimeout(timer);
  }, []);

  const c = config[toast.type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: c.bg, borderLeftColor: c.color, opacity, transform: [{ translateY }] }]}>
      <Ionicons name={c.icon as any} size={22} color={c.color} />
      <Text style={[styles.text, { color: c.color }]} numberOfLines={3}>{toast.text}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={18} color="#999" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  devBanner: {
    backgroundColor: "#E74C3C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 6,
    zIndex: 9999,
  },
  devBannerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
