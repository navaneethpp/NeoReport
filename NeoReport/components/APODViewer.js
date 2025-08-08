import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { getAPOD } from "../services/APOD";

const APODViewer = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApod = async () => {
      try {
        const data = await getAPOD();
        setApod(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApod();
  }, []);

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
      <Text style={styles.date}>{apod.date}</Text>
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
      <Text style={styles.explanation}>{apod.explanation}</Text>
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
    fontSize: 22,
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
    lineHeight: 24,
    marginBottom: 8,
    textAlign: "justify",
  },
  copyright: {
    fontStyle: "italic",
    color: "grey",
  },
});
