import { Marker } from "react-native-maps";

import MapView from "react-native-maps";
import { JumpingPokemon } from "./JumpingPokemonMarker";
import BottomSheet from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { memo, useEffect } from "react";
import { useState } from "react";
import { LocationObjectCoords } from "expo-location";

import * as Location from "expo-location";
import { ThemedText } from "./ThemedText";

export const PokemonMap = memo(function PokemonMap({
  setSelectedPokemonUrl,
  setModalVisible,
  mapMarkers,
  setClickedLocation,
  bottomSheetRef,
}: {
  setSelectedPokemonUrl: (url: string) => void;
  setModalVisible: (visible: boolean) => void;
  mapMarkers: { latitude: number; longitude: number; pokemonUrl: string }[];
  setClickedLocation: (location: LocationObjectCoords) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}) {
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const initialRegion = {
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (!location) {
    return <ThemedText>Loading...</ThemedText>;
  }

  if (errorMsg) {
    return <ThemedText>{errorMsg}</ThemedText>;
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={true}
      showsMyLocationButton={true}
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
          <JumpingPokemon marker={marker} />
        </Marker>
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
