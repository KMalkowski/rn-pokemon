import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  cancelAnimation,
} from "react-native-reanimated";
import { useEffect } from "react";

const createJumpAnimation = () => {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(withTiming(20, { duration: 500 }), -1, true);

    return () => {
      cancelAnimation(offset);
    };
  }, []);

  return offset;
};

export function JumpingPokemon({
  marker,
}: {
  marker: { latitude: number; longitude: number; pokemonUrl: string };
}) {
  const pokemonBottomOffset = createJumpAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -pokemonBottomOffset.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 40,
          height: 40,
          position: "relative",
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={{
          uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${marker.pokemonUrl
            .split("/")
            .findLast((part) => part !== "")}.png`,
        }}
        style={{ width: 40, height: 40 }}
        contentFit="contain"
      />
    </Animated.View>
  );
}
