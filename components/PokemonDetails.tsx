import { StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';

import { ThemedView } from "./ThemedView"
import { ThemedText } from "./ThemedText"
import { useQuery } from "@tanstack/react-query"
import { useMMKVBoolean } from 'react-native-mmkv';
import { Pokemon } from '@/app/(tabs)';
import { IconSymbol } from './ui/IconSymbol';
import React from 'react';
import { Image } from 'expo-image';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface PokemonDetails {
    id: number
    name: string
    order: number
    form_order: number
    is_default: boolean
    is_battle_only: boolean
    is_mega: boolean
    form_name: string
    pokemon: Pokemon
    sprites: Sprites
    types: Type[]
    version_group: VersionGroup
}

export interface Sprites {
    back_default: string
    back_female: any
    back_shiny: string
    back_shiny_female: any
    front_default: string
    front_female: any
    front_shiny: string
    front_shiny_female: any
}

export interface Type {
    slot: number
    type: Type2
}

export interface Type2 {
    name: string
    url: string
}

export interface VersionGroup {
    name: string
    url: string
}

const fetchPokemonDetails = async (url: string): Promise<PokemonDetails> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json() as Promise<PokemonDetails>;
};

export function PokemonDetails({ selectedPokemon }: { selectedPokemon: Pokemon | null }) {
    const { data: pokemonDetails, isLoading: isPokemonDetailsLoading } = useQuery({ queryKey: ['pokemonDetails', selectedPokemon?.url], queryFn: () => fetchPokemonDetails(selectedPokemon?.url || '') })
    const [isPokemonFavorite, setIsPokemonFavorite] = useMMKVBoolean(selectedPokemon?.name || '')

    const colorScheme = useColorScheme();

    const backgroundColor = useThemeColor({ light: 'white', dark: 'black' }, 'background');


    return (
        <SafeAreaView>
            <ThemedView style={styles.detailsContainer}>
                <ThemedView style={[styles.detailsDescription, { backgroundColor }]}>
                    <ThemedText type="subtitle">{selectedPokemon?.name}{isPokemonDetailsLoading ? (
                        <ActivityIndicator />
                    ) : null}</ThemedText>
                    {selectedPokemon?.name ?
                        <TouchableOpacity style={styles.favoriteButton} onPress={() => {
                            setIsPokemonFavorite(!isPokemonFavorite)
                        }}>
                            {isPokemonFavorite ? (
                                <>
                                    <IconSymbol size={28} name="heart.fill" color={colorScheme === 'light' ? '#001a72' : '#f8f9ff'} />
                                    <ThemedText type="subtitle">Your favorite</ThemedText>
                                </>
                            ) : (
                                <>
                                    <IconSymbol size={28} name="heart" color={colorScheme === 'light' ? '#001a72' : '#f8f9ff'} />
                                    <ThemedText type="subtitle">Add to favorites</ThemedText>
                                </>
                            )}
                        </TouchableOpacity> : null}
                </ThemedView>
                <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon?.url.split('/').findLast(part => part !== '')}.png` }} style={styles.pokemonImage} />
            </ThemedView>
            <ThemedView style={styles.detailsContainer}>
                {pokemonDetails?.is_battle_only ? <ThemedText type="subtitle">Battle only!</ThemedText> : null}
                <ThemedText type="subtitle">{pokemonDetails?.types.map(type => type.type.name).join(', ')}</ThemedText>
            </ThemedView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    pokemonImage: {
        width: 100,
        height: 100,
    },
    detailsContainer: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: 'none',
    },
    detailsDescription: {
        flex: 1,
        gap: 8,
        justifyContent: 'center',
    },
    favoriteButton: {
        backgroundColor: 'gray',
        padding: 8,
        borderRadius: 4,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    }
});