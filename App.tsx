import "expo-dev-client";
import "./firebase";

import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "react-error-boundary";
import { LogBox } from "react-native";
import { Host } from "react-native-portalize";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorFallback } from "./components/ErrorFallback";
import StackNavigator from "./navigators/Stack";

LogBox.ignoreLogs(["AsyncStorage has been extracted"]);

const client = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
    </ErrorBoundary>
  );
}
