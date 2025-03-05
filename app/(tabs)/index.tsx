import { StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { PokemonDetails } from '@/components/PokemonDetails';

export interface PokemonList {
  count: number
  next: string
  previous: any
  results: Pokemon[]
}

export interface Pokemon {
  name: string
  url: string
}

const fetchPokemonList = async (page: number): Promise<PokemonList> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${page * 20}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json() as Promise<PokemonList>;
};

export default function TabTwoScreen() {
  const [page, setPage] = useState(0);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['pokemons', page], queryFn: () => fetchPokemonList(page) })

  const bottomSheetRef = useRef<BottomSheet>(null);
  const backgroundColor = useThemeColor({ light: 'white', dark: 'black' }, 'background');

  useEffect(() => {
    if (data) {
      setPokemons((prev) => [...prev, ...data.results]);
    }
  }, [data]);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>Pokemons {isLoading ? (
          <ActivityIndicator />
        ) : null}</ThemedText>
      </ThemedView>

      <FlatList
        onTouchStart={() => {
          bottomSheetRef.current?.close()
        }}
        data={pokemons}
        onEndReached={() => {
          setPage(page + 1)
        }}
        renderItem={({ item }) => <ThemedView style={styles.stepContainer}>
          <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.url.split('/').findLast(part => part !== '')}.png` }} style={styles.pokemonImage} />
          <ThemedView style={styles.description}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <TouchableOpacity style={styles.detailsButton} onPress={() => {
              setSelectedPokemon(item)
              bottomSheetRef.current?.expand()
            }}>
              <ThemedText type="subtitle">Details</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>}
        keyExtractor={item => item.url}
      />

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['50%']}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        index={-1}
      >
        <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
          <SafeAreaView>
            {selectedPokemon && <PokemonDetails selectedPokemon={selectedPokemon} />}
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'white'
  },
  titleContainer: {
    marginHorizontal: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  detailsButton: {
    backgroundColor: 'gray',
    padding: 8,
    borderRadius: 4,
    marginRight: 'auto',
  },
  pokemonImage: {
    width: 100,
    height: 100,
  },
  description: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
});
