import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

import { getAPOD } from "../services/APOD";
import BorderedIconButtonClassic from "./buttons/BorderedIconButtonClassic";
import shareUtils from "../utils/shareUtils";
import ImageButton from "./buttons/ImageButton";

// Function to get NASA's current date (based on US Eastern Time)
const getNASADate = () => {
  // Get current UTC time
  const nowUTC = new Date();

  // Convert to US Eastern Time (handles EDT/EST offset manually as -4 hours)
  // If you want DST handling, use luxon/dayjs timezone plugins
  const nasaTime = new Date(nowUTC.getTime() - 4 * 60 * 60 * 1000);

  return nasaTime.toISOString().split("T")[0];
};

const APODViewer = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getNASADate());
  const [zoomValue, setZoomValue] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  // Fetch APOD data (with caching and fallback for future dates)
  const fetchAPOD = async () => {
    try {
      setLoading(true);
      setError(null);

      // If selectedDate is after NASA's current date, fallback to NASA's date
      const nasaDate = getNASADate();
      const finalDate =
        new Date(selectedDate) > new Date(nasaDate) ? nasaDate : selectedDate;

      // Check cache first
      const cachedAPOD = await AsyncStorage.getItem(`apod_${finalDate}`);
      if (cachedAPOD) {
        setApod(JSON.parse(cachedAPOD));
        return;
      }

      // Fetch from API
      const data = await getAPOD(finalDate);
      setApod(data);

      // Cache the response
      await AsyncStorage.setItem(`apod_${finalDate}`, JSON.stringify(data));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("No APOD found for this date. Try a different one.");
      } else {
        setError(err.message);
      }
      Alert.alert("Error", "Failed to fetch APOD. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    setDatePickerVisible(false);
  };

  // Handle video APODs (open in browser)
  const handleVideoPress = () => {
    if (apod?.media_type === "video" && apod.url) {
      WebBrowser.openBrowserAsync(apod.url);
    } else {
      Alert.alert(
        "Video Missing",
        "The video is missing. Please cooperate with us."
      );
    }
  };

  // Share APOD
  const handleShare = async () => {
    if (!apod) return;

    try {
      setIsSharing(true);
      await shareUtils(apod);
    } catch (err) {
      Alert.alert("Error", "Failed to share APOD.");
    } finally {
      setIsSharing(false);
    }
  };

  // Zoom controls
  const fontSizeIncrease = () => setZoomValue((prev) => Math.min(prev + 2, 20));
  const fontSizeDecrease = () => setZoomValue((prev) => Math.max(prev - 2, 0));

  // Fetch APOD on mount or date change
  useEffect(() => {
    fetchAPOD();
  }, [selectedDate]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={fetchAPOD}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!apod) {
    return (
      <View style={styles.center}>
        <Text>No APOD data available.</Text>
        <TouchableOpacity onPress={fetchAPOD}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <BorderedIconButtonClassic
          buttonTitle={selectedDate}
          iconName="calendar-outline"
          onPress={() => setDatePickerVisible(true)}
        />
        <View style={styles.topBarRight}>
          <View style={styles.zoomControls}>
            <TouchableOpacity onPress={fontSizeDecrease}>
              <MaterialIcons name="zoom-out" size={28} />
            </TouchableOpacity>

            <TouchableOpacity onPress={fontSizeIncrease}>
              <MaterialIcons name="zoom-in" size={28} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleShare} disabled={isSharing}>
            <MaterialIcons name="share" size={28} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()}
        date={new Date(selectedDate)}
      />

      {/* APOD Content */}
      <Text style={styles.title}>{apod.title}</Text>

      {apod.media_type === "image" ? (
        <ImageButton image={apod.url} />
      ) : (
        <TouchableOpacity
          onPress={handleVideoPress}
          style={styles.videoContainer}
        >
          <Text style={styles.videoLink}>🎥 Watch Video (Tap to Open)</Text>
        </TouchableOpacity>
      )}

      <Text
        style={[
          styles.explanation,
          { fontSize: 20 + zoomValue, lineHeight: 28 + 1.5 * zoomValue },
        ]}
      >
        &nbsp;&nbsp;&nbsp;&nbsp;{apod.explanation}
      </Text>

      {apod.copyright && (
        <Text style={styles.copyright}>© {apod.copyright}</Text>
      )}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  topBarRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  zoomControls: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  videoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  videoLink: {
    color: "#0066cc",
    fontWeight: "500",
  },
  explanation: {
    marginBottom: 16,
    textAlign: "justify",
  },
  copyright: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "right",
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  retry: {
    color: "#0066cc",
    fontWeight: "500",
  },
});

export default APODViewer;
