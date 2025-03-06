import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  useFaceDetector,
  FaceDetectionOptions,
  Face,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import { ThemedView } from "@/components/ThemedView";
import { Image } from "expo-image";
import { favouritesKv } from "@/store/favourites";
import { useMMKVListener } from "react-native-mmkv";

export default function App() {
  const [favouritePokemons, setFavouritePokemons] = useState<string[]>(
    favouritesKv.getAllKeys()
  );
  useMMKVListener(() => {
    setFavouritePokemons(favouritesKv.getAllKeys());
  }, favouritesKv);

  const [facesState, setFacesState] = useState<Face[]>([]);

  const { width, height } = useWindowDimensions();
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    autoMode: true,
    windowWidth: width,
    windowHeight: height,
  }).current;

  const device = useCameraDevice("front");
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log({ status });
    })();
  }, [device]);

  const setFacesInJS = Worklets.createRunOnJS(setFacesState);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    runAtTargetFps(120, () => {
      "worklet";
      const detectedFaces = detectFaces(frame);
      setFacesInJS(detectedFaces);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {!!device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      ) : (
        <Text>No Device</Text>
      )}
      {facesState[0] && (
        <ThemedView
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            transform: [
              { translateX: facesState[0].bounds.x },
              { translateY: facesState[0].bounds.y },
            ],
            width: facesState[0].bounds.width,
            height: facesState[0].bounds.height,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {favouritePokemons.map((pokemon) => (
            <View
              style={{
                width: facesState[0].bounds.width / favouritePokemons.length,
                height: facesState[0].bounds.height / favouritePokemons.length,
              }}
              key={pokemon}
            >
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon
                    .split("/")
                    .findLast((part) => part !== "")}.png`,
                }}
                style={styles.pokemonImage}
                contentFit="contain"
              />
            </View>
          ))}
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pokemonImage: {
    width: 120,
    height: 120,
    position: "absolute",
  },
});
