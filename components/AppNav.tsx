import { useMemo, useState } from "react";
import { usePathname, useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

type NavItem = {
  label: string;
  path: string;
  href: Href;
};

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/home", href: "./home" },
  { label: "Profile", path: "/profile", href: "./profile" },
  { label: "Queue", path: "/queue", href: "./queue" },
  { label: "Equipment", path: "/equipment", href: "./equipment" },
];

export const AppNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeRoute = useMemo(() => {
    const matched = navItems.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    );
    return matched?.path;
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("../login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.links}>
        {navItems.map((item) => {
          const isActiveRoute = activeRoute === item.path;

          return (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href)}
              style={[styles.link, isActiveRoute ? styles.activeLink : null]}
            >
              <Text
                style={[
                  styles.linkText,
                  isActiveRoute ? styles.activeLinkText : null,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        onPress={handleLogout}
        disabled={isLoggingOut}
        style={({ pressed }) => [
          styles.logout,
          pressed ? styles.logoutPressed : null,
          isLoggingOut ? styles.logoutDisabled : null,
        ]}
      >
        <Text style={styles.logoutText}>{isLoggingOut ? "Logging out..." : "Log out"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  links: {
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  link: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeLink: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  linkText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  activeLinkText: {
    color: "#FFFFFF",
  },
  logout: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.danger,
  },
  logoutPressed: {
    backgroundColor: theme.colors.dangerPressed,
  },
  logoutDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

