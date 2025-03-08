import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { LocationObjectCoords } from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { mapMarkersKv } from "@/store/mapMarkers";
import { favouritesKv } from "@/store/favourites";
import { useMMKVListener } from "react-native-mmkv";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { ThemedView } from "@/components/ThemedView";
import { PokemonDetails } from "@/components/PokemonDetails";

type MapMarker = {
  latitude: number;
  longitude: number;
  pokemonUrl: string;
};

export default function MapScreen() {
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [clickedLocation, setClickedLocation] =
    useState<LocationObjectCoords | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPokemonUrl, setSelectedPokemonUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  const [favouritePokemons, setFavouritePokemons] = useState<string[]>(
    favouritesKv.getAllKeys()
  );

  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>(() => {
    const markers = mapMarkersKv.getAllKeys().map((key) => {
      const markerData = JSON.parse(mapMarkersKv.getString(key) || "{}");
      return {
        ...markerData,
        pokemonUrl: key,
      };
    });
    return markers;
  });

  useMMKVListener(() => {
    setFavouritePokemons(favouritesKv.getAllKeys());
  }, favouritesKv);

  useMMKVListener(() => {
    const markers = mapMarkersKv.getAllKeys().map((key) => {
      const markerData = JSON.parse(mapMarkersKv.getString(key) || "{}");
      return {
        ...markerData,
        pokemonUrl: key,
      };
    });
    setMapMarkers(markers);
  }, mapMarkersKv);

  const availableFavouritePokemons = favouritePokemons.filter(
    (pokemon) => !mapMarkers.some((marker) => marker.pokemonUrl === pokemon)
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  const backgroundColor = useThemeColor(
    { light: "white", dark: "black" },
    "background"
  );

  if (!location) {
    return <ThemedText>Loading...</ThemedText>;
  }

  if (errorMsg) {
    return <ThemedText>{errorMsg}</ThemedText>;
  }

  const latitudeDelta = 0.018 / 10;
  const longitudeDelta =
    0.018 / (10 * Math.cos((location.latitude * Math.PI) / 180));

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta,
          longitudeDelta,
        }}
        showsUserLocation={true}
        onLongPress={(e) => {
          const { coordinate } = e.nativeEvent;
          setClickedLocation({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
          });

          bottomSheetRef.current?.expand();
        }}
        onTouchStart={() => {
          bottomSheetRef.current?.close();
          setModalVisible(false);
        }}
      >
        {mapMarkers.map((marker) => (
          <Marker
            key={marker.pokemonUrl}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => {
              setSelectedPokemonUrl(marker.pokemonUrl);
              setModalVisible(true);
            }}
          >
            <Image
              source={{
                uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${marker.pokemonUrl
                  .split("/")
                  .findLast((part) => part !== "")}.png`,
              }}
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        ))}
      </MapView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            {selectedPokemonUrl && (
              <PokemonDetails selectedPokemonUrl={selectedPokemonUrl} />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.removeButton]}
                onPress={() => {
                  if (selectedPokemonUrl) {
                    mapMarkersKv.delete(selectedPokemonUrl);
                    setModalVisible(false);
                    setSelectedPokemonUrl(null);
                  }
                }}
              >
                <ThemedText>Remove from map</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedPokemonUrl(null);
                }}
              >
                <ThemedText>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        index={-1}
      >
        <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
          <SafeAreaView>
            <ThemedView style={styles.pokemonListContainer}>
              {availableFavouritePokemons.length > 0 ? (
                <FlatList
                  data={availableFavouritePokemons}
                  numColumns={3}
                  renderItem={({ item }) => (
                    <View
                      key={item}
                      style={styles.gridItem}
                      onTouchStart={() => {
                        if (clickedLocation) {
                          const markerData = {
                            latitude: clickedLocation.latitude,
                            longitude: clickedLocation.longitude,
                          };
                          mapMarkersKv.set(item, JSON.stringify(markerData));
                          bottomSheetRef.current?.close();
                        }
                      }}
                    >
                      <Image
                        source={{
                          uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item
                            .split("/")
                            .findLast((part) => part !== "")}.png`,
                        }}
                        style={styles.pokemonImage}
                        contentFit="contain"
                      />
                    </View>
                  )}
                />
              ) : (
                <ThemedText type="subtitle" style={{ textAlign: "center" }}>
                  Go pick some favorite Pokémon first!
                </ThemedText>
              )}
            </ThemedView>
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheet>
    </View>
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
  map: {
    width: "100%",
    height: "100%",
  },
  pokemonImage: {
    width: 100,
    height: 100,
  },
  pokemonListContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridItem: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#ff453a",
  },
  closeButton: {
    backgroundColor: "#ddd",
  },
});
