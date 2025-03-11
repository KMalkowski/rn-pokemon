import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColor } from '@/hooks/useThemeColor';
import BottomSheet from '@gorhom/bottom-sheet';
import { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
    interpolateColor
} from 'react-native-reanimated';
import { IconSymbol } from './ui/IconSymbol';
import { useMMKVString } from 'react-native-mmkv';
import { favouritesKv } from '@/store/favourites';
import * as Haptics from 'expo-haptics';
import { Pokemon } from '@/app/(tabs)';

export function PokemonListItem({
    pokemon,
    setSelectedPokemon,
    bottomSheetRef
}: {
    pokemon: Pokemon;
    setSelectedPokemon: Dispatch<SetStateAction<Pokemon | null>>;
    bottomSheetRef: React.RefObject<BottomSheet>;
}) {
    const [isPokemonFavorite, setIsPokemonFavorite] = useMMKVString(
        pokemon.url,
        favouritesKv
    );
    const [hapticsFiredDirection, setHapticsFiredDirection] = useState('right');
    const backgroundColor = useThemeColor(
        { light: 'white', dark: 'black' },
        'background'
    );
    const buttonColor = useThemeColor(
        { light: '#e6efff', dark: '#1a1a1a' },
        'background'
    );

    const start = useSharedValue({ x: 0, y: 0 });
    const isPressed = useSharedValue(false);
    const offset = useSharedValue(0);
    const heartFill = useSharedValue(0);
    const heartScale = useSharedValue(1);
    const isLiked = useSharedValue(isPokemonFavorite);

    function triggerHaptics(direction: string) {
        if (hapticsFiredDirection === 'right' && direction === 'left') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setHapticsFiredDirection('left');
        } else if (hapticsFiredDirection === 'left' && direction === 'right') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setHapticsFiredDirection('right');
        }
    }

    const gesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-5, 5])
        .onBegin(() => {
            isPressed.value = true;
        })
        .onUpdate((e) => {
            if (e.translationX + start.value.x < 0) {
                offset.value = e.translationX + start.value.x;
                if (Math.abs(offset.value) >= 100) {
                    heartScale.value = withTiming(1.3, { duration: 200 });
                    runOnJS(triggerHaptics)('left');
                    isLiked.value = pokemon.url;
                } else {
                    runOnJS(triggerHaptics)('right');
                    isLiked.value = undefined;
                }
                heartFill.value = interpolate(
                    Math.abs(offset.value),
                    [0, 100],
                    [0, 1],
                    Extrapolation.CLAMP
                );
            } else if (e.translationX + start.value.x > 0) {
                offset.value = start.value.x + e.translationX;
                heartFill.value = interpolate(
                    Math.abs(offset.value),
                    [0, 100],
                    [0, 1],
                    Extrapolation.CLAMP
                );

                if (Math.abs(offset.value) >= 100) {
                    runOnJS(triggerHaptics)('right');
                } else {
                    runOnJS(triggerHaptics)('left');
                }
            }
        })
        .onEnd(() => {
            if (offset.value >= 100) {
                if (isLiked.value?.length) {
                    runOnJS(setIsPokemonFavorite)(pokemon.url);
                } else {
                    runOnJS(setIsPokemonFavorite)(undefined);
                }
            }
            isPressed.value = false;
            offset.value = withTiming(0, { duration: 300 });
            heartFill.value = withTiming(0, { duration: 300 });
            heartScale.value = withTiming(1, { duration: 300 });
        })
        .onFinalize(() => {
            isPressed.value = false;
        });

    const stepContainerAnimatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: offset.value }]
        };
    });

    const heartAnimatedStyle = useAnimatedStyle(() => {
        return {
            height: `${heartFill.value * 100}%`,
            transform: [{ scale: heartScale.value }]
        };
    });

    const heartToBeCrossStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    heartFill.value,
                    [1, 0],
                    [0, 1],
                    Extrapolation.CLAMP
                )
            }
        ]
    }));

    return (
        <ThemedView style={styles.likeContainer}>
            <Animated.View
                style={[styles.crossHeartContainer, heartToBeCrossStyle]}
            >
                <IconSymbol name={'heart.fill'} size={46} color="red" />
            </Animated.View>
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.stepContainer,
                        stepContainerAnimatedStyles,
                        { backgroundColor }
                    ]}
                >
                    <ThemedView style={styles.description}>
                        <ThemedText type="subtitle" style={styles.pokemonName}>
                            {pokemon.name}
                        </ThemedText>
                        <TouchableOpacity
                            style={[
                                styles.detailsButton,
                                { backgroundColor: buttonColor }
                            ]}
                            onPress={() => {
                                setSelectedPokemon(pokemon);
                                bottomSheetRef.current?.expand();
                            }}
                        >
                            <ThemedText type="subtitle">Details</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <Image
                        source={{
                            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url
                                .split('/')
                                .findLast((part) => part !== '')}.png`
                        }}
                        style={styles.pokemonImage}
                    />
                </Animated.View>
            </GestureDetector>
            <ThemedView style={styles.heartContainer}>
                <IconSymbol
                    name={isPokemonFavorite ? 'heart.fill' : 'heart'}
                    size={46}
                    color="red"
                />
                {!isPokemonFavorite && (
                    <Animated.View
                        style={[styles.filledHeart, heartAnimatedStyle]}
                    >
                        <IconSymbol name={'heart.fill'} size={46} color="red" />
                    </Animated.View>
                )}
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    stepContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        zIndex: 2
    },
    heartContainer: {
        position: 'absolute',
        right: 12,
        borderRadius: 12,
        zIndex: 1
    },
    crossHeartContainer: {
        position: 'absolute',
        left: 12,
        borderRadius: 12,
        zIndex: 1
    },
    filledHeart: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden'
    },
    likeContainer: {
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailsButton: {
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: 'flex-start'
    },
    pokemonImage: {
        width: 80,
        height: 80
    },
    description: {
        flex: 1,
        gap: 4
    },
    pokemonName: {
        fontSize: 18,
        textTransform: 'capitalize'
    }
});
