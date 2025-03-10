import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { PokemonDetails } from "@/components/PokemonDetails";
import { PokemonListItem } from "@/components/PokemonListItem";

export type PokemonList = {
  count: number;
  next: string;
  previous: any;
  results: Pokemon[];
};

export type Pokemon = {
  name: string;
  url: string;
};

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
              onRefresh={() => {
                queryClient.clear();
                setPokemons([]);
                setPage(0);
                refetch();
              }}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PokemonListItem
              key={item.url}
              pokemon={item}
              setSelectedPokemon={setSelectedPokemon}
              bottomSheetRef={bottomSheetRef}
            />
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
              <PokemonDetails selectedPokemonUrl={selectedPokemon.url} />
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
});
