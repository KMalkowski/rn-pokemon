import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { PokemonDetails } from "@/components/PokemonDetails";

export interface PokemonList {
  count: number;
  next: string;
  previous: any;
  results: Pokemon[];
}

export interface Pokemon {
  name: string;
  url: string;
}

const fetchPokemonList = async (page: number): Promise<PokemonList> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${page * 20}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json() as Promise<PokemonList>;
};

export default function PokemonListScreen() {
  const [page, setPage] = useState(0);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pokemons", page],
    queryFn: () => fetchPokemonList(page),
  });

  const bottomSheetRef = useRef<BottomSheet>(null);
  const backgroundColor = useThemeColor(
    { light: "white", dark: "black" },
    "background"
  );
  const buttonColor = useThemeColor(
    { light: "#e6efff", dark: "#1a1a1a" },
    "background"
  );

  useEffect(() => {
    if (data) {
      setPokemons((prev) => [...prev, ...data.results]);
    }
  }, [data]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" },
      ]}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Pokémon List {isLoading ? <ActivityIndicator /> : null}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={[
          styles.listWrapper,
          { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" },
        ]}
      >
        <FlatList
          onTouchStart={() => {
            bottomSheetRef.current?.close();
          }}
          data={pokemons}
          onEndReached={() => {
            setPage(page + 1);
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={async () => {
                await queryClient.clear();
                setPokemons([]);
                setPage(0);
                refetch();
              }}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ThemedView style={[styles.stepContainer, { backgroundColor }]}>
              <ThemedView style={styles.description}>
                <ThemedText type="subtitle" style={styles.pokemonName}>
                  {item.name}
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.detailsButton,
                    { backgroundColor: buttonColor },
                  ]}
                  onPress={() => {
                    setSelectedPokemon(item);
                    bottomSheetRef.current?.expand();
                  }}
                >
                  <ThemedText type="subtitle">Details</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.url
                    .split("/")
                    .findLast((part) => part !== "")}.png`,
                }}
                style={styles.pokemonImage}
              />
            </ThemedView>
          )}
          keyExtractor={(item) => item.url}
        />
      </ThemedView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        index={-1}
      >
        <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
          <SafeAreaView>
            {selectedPokemon && (
              <PokemonDetails selectedPokemon={selectedPokemon} />
            )}
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  detailsButton: {
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  pokemonImage: {
    width: 80,
    height: 80,
  },
  description: {
    flex: 1,
    gap: 4,
  },
  pokemonName: {
    fontSize: 18,
    textTransform: "capitalize",
  },
});
