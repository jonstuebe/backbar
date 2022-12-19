import "./firebase";
import "expo-dev-client";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Host } from "react-native-portalize";
import { LogBox } from "react-native";

import StackNavigator from "./navigators/Stack";
import { StatusBar } from "expo-status-bar";

LogBox.ignoreLogs(["AsyncStorage has been extracted"]);

const client = new QueryClient();

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <SafeAreaProvider>
        <Host>
          <QueryClientProvider client={client}>
            <StackNavigator />
          </QueryClientProvider>
        </Host>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
