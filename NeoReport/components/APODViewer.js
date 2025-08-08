import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";

import { getAPOD } from "../services/APOD";
import BorderedIconButtonClassic from "./buttons/BorderedIconButtonClassic";

const APODViewer = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [zoomValue, setZoomValue] = useState(0);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const fontSizeIncrease = () =>
    setZoomValue(zoomValue < 20 ? zoomValue + 2 : zoomValue);

  const fontSizeDecrease = () =>
    setZoomValue(zoomValue >= 0 ? zoomValue - 2 : zoomValue);

  const handleConfirm = (date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
    hideDatePicker();
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    setSelectedDate(formattedDate);
  }, []);

  useEffect(() => {
    const fetchApod = async () => {
      try {
        const data = await getAPOD((date = selectedDate));
        setApod(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApod();
  }, [selectedDate]);

  useEffect(() => {}, [zoomValue]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
        <Text>Check your API Key and internet connection</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.TopBar}>
        <BorderedIconButtonClassic
          buttonTitle={selectedDate}
          iconName="calendar-outline"
          onPress={showDatePicker}
        />
        <View style={styles.ZoomContainer}>
          <TouchableOpacity onPress={fontSizeIncrease}>
            <MaterialIcons name="zoom-in" size={32} />
          </TouchableOpacity>

          <TouchableOpacity onPress={fontSizeDecrease}>
            <MaterialIcons name="zoom-out" size={32} />
          </TouchableOpacity>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        style={{ borderWidth: 2, borderColor: "black" }}
        date={new Date(selectedDate)}
        maximumDate={new Date()}
      />

      <Text style={styles.title}>{apod.title}</Text>

      {
        (apod.media_type = "image" ? (
          <Image
            source={{ uri: apod.url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text>Today's APOD IS A Video: {apod.url}</Text>
        ))
      }
      <Text
        style={[
          styles.explanation,
          { fontSize: 16 + zoomValue, lineHeight: 24 + zoomValue },
        ]}
      >
        {apod.explanation}
      </Text>
      {apod.copyright && (
        <Text style={styles.copyright}>©{apod.copyright}</Text>
      )}
    </ScrollView>
  );
};

export default APODViewer;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 18,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  date: {
    fontSize: 16,
    color: "grey",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 16,
  },
  explanation: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "justify",
  },
  copyright: {
    fontStyle: "italic",
    color: "grey",
  },
  TopBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 8,
    marginBottom: 8,
  },
  ZoomContainer: {
    flexDirection: "row",
  },
});
