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
    { light: "white", dark: "#2a2a2a" },
    "background"
  );

  const buttonColor = useThemeColor(
    { light: "#e6efff", dark: "#1a1a1a" },
    "background"
  );

  return (
    <ThemedView style={[styles.favouriteContainer, { backgroundColor }]}>
      <ThemedView style={styles.detailsContainer}>
        <ThemedView style={styles.detailsDescription}>
          <ThemedText type="subtitle" style={styles.pokemonName}>
            {pokemonDetails?.name}
            {isPokemonDetailsLoading ? <ActivityIndicator /> : null}
          </ThemedText>
          {pokemonDetails?.name ? (
            <TouchableOpacity
              style={[styles.favoriteButton, { backgroundColor: buttonColor }]}
              onPress={() => {
                favouritesKv.delete(pokemonUrl);
              }}
            >
              <IconSymbol
                size={24}
                name="heart.fill"
                color={colorScheme === "light" ? "#ff3b30" : "#ff453a"}
              />
              <ThemedText type="subtitle" style={styles.buttonText}>
                Remove
              </ThemedText>
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
          contentFit="contain"
        />
      </ThemedView>
      <ThemedView style={styles.typeContainer}>
        {pokemonDetails?.is_battle_only && (
          <ThemedText style={styles.battleOnly}>Battle only!</ThemedText>
        )}
        <ThemedText style={styles.types}>
          {pokemonDetails?.types.map((type) => type.type.name).join(", ")}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pokemonImage: {
    width: 120,
    height: 120,
  },
  detailsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  detailsDescription: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  favoriteButton: {
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  favouriteContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  typeContainer: {
    padding: 16,
    paddingTop: 0,
  },
  types: {
    opacity: 0.7,
    textTransform: "capitalize",
  },
  battleOnly: {
    color: "#ff3b30",
    fontWeight: "600",
    marginBottom: 4,
  },
});
