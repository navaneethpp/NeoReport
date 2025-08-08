import { View, Text } from "react-native";
import APODViewer from "../components/APODViewer";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  return (
    <SafeAreaView>
      <APODViewer />
    </SafeAreaView>
  );
};

export default HomeScreen;
