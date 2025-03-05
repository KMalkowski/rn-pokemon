import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useQuery } from "@tanstack/react-query";
import { IconSymbol } from "./ui/IconSymbol";
import React from "react";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchPokemonDetails } from "./PokemonDetails";
import { favouritesKv } from "@/store/favourites";

export function FavouritePokemonItem({ pokemonUrl }: { pokemonUrl: string }) {
  const { data: pokemonDetails, isLoading: isPokemonDetailsLoading } = useQuery(
    {
      queryKey: ["pokemonDetails", pokemonUrl],
      queryFn: () => fetchPokemonDetails(pokemonUrl),
    }
  );

  const colorScheme = useColorScheme();

  const backgroundColor = useThemeColor(
    { light: "white", dark: "black" },
    "background"
  );

  return (
    <ThemedView style={styles.favouriteContainer}>
      <ThemedView style={styles.detailsContainer}>
        <ThemedView style={[styles.detailsDescription, { backgroundColor }]}>
          <ThemedText type="subtitle">
            {pokemonDetails?.name}
            {isPokemonDetailsLoading ? <ActivityIndicator /> : null}
          </ThemedText>
          {pokemonDetails?.name ? (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => {
                favouritesKv.delete(pokemonUrl);
              }}
            >
              <IconSymbol
                size={28}
                name="heart.fill"
                color={colorScheme === "light" ? "#001a72" : "#f8f9ff"}
              />
              <ThemedText type="subtitle">Remove</ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
        <Image
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonUrl
              .split("/")
              .findLast((part) => part !== "")}.png`,
          }}
          style={styles.pokemonImage}
        />
      </ThemedView>
      <ThemedView style={styles.detailsContainer}>
        {pokemonDetails?.is_battle_only ? (
          <ThemedText type="subtitle">Battle only!</ThemedText>
        ) : null}
        <ThemedText type="subtitle">
          {pokemonDetails?.types.map((type) => type.type.name).join(", ")}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pokemonImage: {
    width: 100,
    height: 100,
  },
  detailsContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "none",
    padding: 8,
  },
  detailsDescription: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  favoriteButton: {
    backgroundColor: "gray",
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    width: "auto",
  },
  title: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "white",
  },
  favouriteContainer: {
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "black",
    marginBottom: 16,
  },
});
