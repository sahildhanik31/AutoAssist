import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppBackButton from "@/components/common/AppBackButton";
// Existing reusable components
import CategoryChip from "../../components/common/CategoryChip";
import ServiceCard from "../../components/ui/ServiceCard";

// Existing data + types
import { services } from "../../utils/services";
import { serviceCategories } from "../../utils/serviceCategories";

const ALL_CATEGORY_ID = "all";

const BookServiceScreen: React.FC = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORY_ID);

  // Categories list
  const categories = useMemo(
    () => [
      {
        id: ALL_CATEGORY_ID,
        title: "All",
        description: "All Services",
        iconName: "apps",
        color: "#2563EB",
        displayOrder: 0,
      },
      ...serviceCategories,
    ],
    []
  );

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORY_ID ||
        service.category === selectedCategory;

      const matchesSearch = service.title
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
  <AppBackButton />
  <Text style={styles.headerTitle}>Book a Service</Text>
  <Text style={styles.headerSubtitle}>
    Choose from our trusted car care services
  </Text>
</View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>

      {/* Services */}
      {filteredServices.length > 0 ? (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => {
                if (item.id === "roadside") {
                  Alert.alert(
                    "Coming Soon",
                    "Roadside assistance services will be available soon."
                  );
                  return;
                }
                router.push({
                  pathname: "/services/Customization",
                  params: {
                    serviceId: item.id,
                  },
                });
              }}
            />
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🔧</Text>
          <Text style={styles.emptyStateTitle}>No services found</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try a different category or search term
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookServiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#123A7A",
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "500",
  },

  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 2,
  },

  searchInput: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 18,
    fontSize: 15,
    fontWeight: "500",
    color: "#172033",
    borderWidth: 1,
    borderColor: "#D7E2F0",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 4,
  },

  categoryList: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 10,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 36,
    gap: 17,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 38,
    marginTop: -45,
  },

  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 24,
    overflow: "hidden",
  },

  emptyStateTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
    textAlign: "center",
  },

  emptyStateSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 7,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
});