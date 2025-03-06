import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, Dimensions, View } from "react-native";
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
} from "react-native-vision-camera";

export default function CameraScreen() {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  if (device == null)
    return (
      <View style={styles.container}>
        <ThemedText>No camera device found</ThemedText>
      </View>
    );
  if (!hasPermission) {
    requestPermission();
    return (
      <View style={styles.container}>
        <ThemedText>No permission</ThemedText>
      </View>
    );
  }

  return <Camera style={styles.camera} device={device} isActive={true} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
