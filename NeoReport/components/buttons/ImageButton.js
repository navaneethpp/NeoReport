import {
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
  View,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
// import second from "expo-per";

const ImageButton = ({ image }) => {
  const [loading, setLoading] = useState(false);
  const albumName = "NASA APOD";

  const downloadImageButtonHandler = async () => {
    setLoading(true);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(); // Request permission
      if (status !== "granted") {
        Alert.alert("Sorry, we need media library permissions to save images!");
        return;
      }

      // Downloading the image
      const fileName = image.split("/").pop() || `apod-${Date.now()}.jpg`;
      let fileUri = FileSystem.cacheDirectory + fileName;

      // For remote URLs, download first
      if (image.startsWith("http")) {
        const downloadResumable = FileSystem.createDownloadResumable(
          image,
          fileUri
        );

        const { uri } = await downloadResumable.downloadAsync();
        fileUri = uri; // Updating the fileUri into file path
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      let album = await MediaLibrary.getAlbumAsync(albumName);

      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      ToastAndroid.show("Image saved to your gallery!");
    } catch (error) {
      // console.error("Error saving image: ", error);

      if (
        error.message.includes("denied") ||
        error.message.includes("cancel")
      ) {
        ToastAndroid.show("Canceled");
      } else {
        ToastAndroid.show("Failed to save the image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: image }}
      resizeMode="cover"
      style={styles.image}
    >
      <TouchableOpacity
        onPress={downloadImageButtonHandler}
        activeOpacity={1} // Fades to 50% opacity when pressed
        style={styles.icon}
      >
        <Ionicons name="cloud-download-outline" color="white" size={24} />
      </TouchableOpacity>

      <View style={styles.loadingIndicator}>
        {loading && <ActivityIndicator size="large" color="white" />}
      </View>
    </ImageBackground>
  );
};

export default ImageButton;

const styles = StyleSheet.create({
  image: {
    height: 300,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  icon: {
    opacity: 0.7,
    alignItems: "flex-end",
    width: "100%",
  },
  loadingIndicator: {
    height: "100%",
    justifyContent: "center",
  },
});
