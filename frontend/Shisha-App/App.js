import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import { RefreshProvider, useRefreshKey } from "./context/RefreshContext"; // Keep imports
import AppNavigator from "./navigation/AppNavigator";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import React from "react"; // Make sure React is imported

// 1. Create a Root component for the app logic that uses the key
const RootAppContent = () => {
  const refreshKey = useRefreshKey();

  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          {/* Key forces the whole navigator to remount */}
          <AppNavigator key={refreshKey} />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

// 2. The main App component handles the loading and contexts
export default function App() {
  // HOOKS CALLED UNCONDITIONALLY:
  const [fontsLoaded] = useFonts({
    // Hook #1
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // 3. Render the RefreshProvider and the RootAppContent
  return (
    <RefreshProvider>
      <RootAppContent />
    </RefreshProvider>
  );
}
