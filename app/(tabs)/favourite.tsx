import { StyleSheet, SafeAreaView, FlatList } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { favouritesKv } from "@/store/favourites";
import { FavouritePokemonItem } from "@/components/FavouritePokemonItem";
import { useMMKVListener } from "react-native-mmkv";
import { useState } from "react";
import { useColorScheme } from "react-native";

export default function FavouriteScreen() {
  const [favouritePokemons, setFavouritePokemons] = useState<string[]>(
    favouritesKv.getAllKeys()
  );
  const colorScheme = useColorScheme();

  useMMKVListener(() => {
    setFavouritePokemons(favouritesKv.getAllKeys());
  }, favouritesKv);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" },
      ]}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Favourite Pokémon
        </ThemedText>
      </ThemedView>
      <ThemedView
        style={[
          styles.favouriteContainer,
          { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" },
        ]}
      >
        {favouritePokemons.length > 0 ? (
          <FlatList
            data={favouritePokemons}
            renderItem={({ item }) => (
              <FavouritePokemonItem pokemonUrl={item} />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyText}>
              No favourite Pokémon yet!
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Add some Pokémon to your favourites to see them here
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  favouriteContainer: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
    opacity: 0.7,
  },
});
