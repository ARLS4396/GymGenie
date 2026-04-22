import { useMemo } from "react";
import { usePathname, useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  { label: "Settings", path: "/settings", href: "./settings" },
];

export const AppNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const activeRoute = useMemo(() => {
    const matched = navItems.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    );
    return matched?.path;
  }, [pathname]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Gym Genie</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.links}
        style={styles.linksScroll}
      >
        {navItems.map((item) => {
          const isActive = activeRoute === item.path;
          return (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href)}
              style={styles.link}
            >
              <Text style={[styles.linkText, isActive && styles.activeLinkText]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeBar} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    height: 52,
  },
  brand: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  linksScroll: {
    flex: 1,
  },
  links: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 2,
  },
  link: {
    paddingHorizontal: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  activeBar: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  linkText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  activeLinkText: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
});
