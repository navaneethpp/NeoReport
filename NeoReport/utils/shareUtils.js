import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Alert, Share } from "react-native";

const shareUtils = async (apod) => {
  try {
    if (!apod) {
      throw new Error("No APOD data to share");
    }

    // Downloading the image
    const imageUri = apod.hdurl || apod.url;
    const filename = imageUri.split("/").pop();
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    const { uri: localUri } = await FileSystem.downloadAsync(
      imageUri,
      filePath
    );

    // Share Content
    await Share.share({
      title: apod.title,
      message: `${apod.title}\n\n${apod.explanation}`,
      url: localUri,
    });
  } catch (error) {
    Alert.alert("Sharing Failed", error.message);
    console.error("Share error: ", error);
  }
};

export default shareUtils;
