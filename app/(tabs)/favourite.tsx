import { StyleSheet, SafeAreaView, FlatList } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { favouritesKv } from "@/store/favourites";
import { FavouritePokemonItem } from "@/components/FavouritePokemonItem";
import { useMMKVListener } from "react-native-mmkv";
import { useState } from "react";

export default function FavouriteScreen() {
  const [favouritePokemons, setFavouritePokemons] = useState<string[]>([]);

  useMMKVListener(() => {
    setFavouritePokemons(favouritesKv.getAllKeys());
  }, favouritesKv);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Favourite
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.favouriteContainer}>
        {favouritePokemons.length > 0 ? (
          <FlatList
            data={favouritePokemons}
            renderItem={({ item }) => (
              <FavouritePokemonItem pokemonUrl={item} />
            )}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">No favourite pokemons yet!</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  titleContainer: {
    marginHorizontal: 8,
  },
  favouriteContainer: {
    display: "flex",
    margin: 8,
    gap: 8,
    backgroundColor: "white",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  title: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "white",
  },
});
