import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useQuery } from "@tanstack/react-query";
import { useMMKVString } from "react-native-mmkv";
import { Pokemon } from "@/app/(tabs)";
import { IconSymbol } from "./ui/IconSymbol";
import React from "react";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { favouritesKv } from "@/store/favourites";

export interface PokemonDetails {
  id: number;
  name: string;
  order: number;
  form_order: number;
  is_default: boolean;
  is_battle_only: boolean;
  is_mega: boolean;
  form_name: string;
  pokemon: Pokemon;
  sprites: Sprites;
  types: Type[];
  version_group: VersionGroup;
}

export interface Sprites {
  back_default: string;
  back_female: any;
  back_shiny: string;
  back_shiny_female: any;
  front_default: string;
  front_female: any;
  front_shiny: string;
  front_shiny_female: any;
}

export interface Type {
  slot: number;
  type: Type2;
}

export interface Type2 {
  name: string;
  url: string;
}

export interface VersionGroup {
  name: string;
  url: string;
}

export const fetchPokemonDetails = async (
  url: string
): Promise<PokemonDetails> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json() as Promise<PokemonDetails>;
};

export function PokemonDetails({
  selectedPokemon,
}: {
  selectedPokemon: Pokemon;
}) {
  const { data: pokemonDetails, isLoading: isPokemonDetailsLoading } = useQuery(
    {
      queryKey: ["pokemonDetails", selectedPokemon?.url],
      queryFn: () => fetchPokemonDetails(selectedPokemon?.url || ""),
    }
  );
  const [isPokemonFavorite, setIsPokemonFavorite] = useMMKVString(
    selectedPokemon?.url,
    favouritesKv
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
  const heartColor = colorScheme === "light" ? "#ff3b30" : "#ff453a";
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );

  return (
    <>
      <ThemedView style={styles.detailsContainer}>
        <ThemedView style={[styles.detailsDescription, { backgroundColor }]}>
          <ThemedText
            type="subtitle"
            style={[styles.pokemonName, { color: textColor }]}
          >
            {selectedPokemon?.name}
            {isPokemonDetailsLoading ? (
              <ActivityIndicator style={styles.loader} />
            ) : null}
          </ThemedText>
          {selectedPokemon?.name ? (
            <TouchableOpacity
              style={[styles.favoriteButton, { backgroundColor: buttonColor }]}
              onPress={() => {
                setIsPokemonFavorite(
                  isPokemonFavorite ? undefined : selectedPokemon?.url
                );
              }}
            >
              {isPokemonFavorite ? (
                <>
                  <IconSymbol size={24} name="heart.fill" color={heartColor} />
                  <ThemedText type="subtitle" style={styles.buttonText}>
                    Your favorite
                  </ThemedText>
                </>
              ) : (
                <>
                  <IconSymbol size={24} name="heart" color={heartColor} />
                  <ThemedText type="subtitle" style={styles.buttonText}>
                    Add to favorites
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </ThemedView>
        <Image
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon?.url
              .split("/")
              .findLast((part) => part !== "")}.png`,
          }}
          style={styles.pokemonImage}
        />
      </ThemedView>
      <ThemedView
        style={[
          styles.detailsContainer,
          styles.infoContainer,
          { backgroundColor },
        ]}
      >
        {pokemonDetails?.is_battle_only ? (
          <ThemedText type="subtitle" style={styles.battleText}>
            Battle only!
          </ThemedText>
        ) : null}
        <ThemedText type="subtitle" style={styles.typesText}>
          {pokemonDetails?.types.map((type) => type.type.name).join(", ")}
        </ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  pokemonImage: {
    width: 120,
    height: 120,
    marginRight: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
    borderRadius: 12,
    marginBottom: 12,
  },
  detailsDescription: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  favoriteButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  buttonText: {
    fontSize: 16,
  },
  loader: {
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
  },
  battleText: {
    color: "#ff3b30",
    fontWeight: "600",
  },
  typesText: {
    textTransform: "capitalize",
  },
});
