import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BorderedIconButtonClassic = ({ buttonTitle, iconName, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name={iconName} size={16} color="grey" />
      <Text style={styles.buttonTitle}>{buttonTitle}</Text>
    </TouchableOpacity>
  );
};

export default BorderedIconButtonClassic;

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    backfaceVisibility: "hidden",
    borderRadius: screenWidth * 0.019,
    borderStyle: "solid",
    borderWidth: screenWidth * 0.01,
    boxSizing: "border-box",
    cursor: "pointer",
    paddingVertical: 10,
    paddingHorizontal: 18,
    position: "relative",
    flexDirection: "row",
    gap: 12,
    elevation: 12,
  },
  buttonTitle: {
    color: "#212121",
    fontSize: 17,
    fontWeight: 700,
  },
});
