import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Add from "../screens/Add";
import Home from "../screens/Home";
import Login from "../screens/Login";
import Register from "../screens/Register";
import { useAuthState } from "../hooks/useAuthState";
import { ActivityIndicator, View } from "react-native";
import { MotiText } from "moti";
import { iOSUIKit } from "react-native-typography";
import { useTheme } from "@react-navigation/native";

import ItemEdit from "../screens/ItemEdit";
import Settings from "../screens/Settings";
import ForgotPassword from "../screens/ForgotPassword";
import SwitchAccounts from "../screens/SwitchAccounts";

export type StackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  Home: undefined;
  Add: undefined;
  Edit: { id: string };

  Settings: undefined;
  SwitchAccounts: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

export default function StackNavigator() {
  const { colors } = useTheme();
  const status = useAuthState();

  if (status === "loading") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <MotiText
          from={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          style={[
            iOSUIKit.largeTitleEmphasizedWhite,
            { letterSpacing: -0.45, marginBottom: 16 },
          ]}
        >
          Backbar
        </MotiText>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {status === "unauthenticated" ? (
        <>
          <Stack.Group
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={Login} />
          </Stack.Group>
          <Stack.Group
            screenOptions={{
              title: "",
            }}
          >
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </Stack.Group>
        </>
      ) : null}

      {status === "authenticated" ? (
        <>
          <Stack.Group
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen component={Home} name="Home" />
          </Stack.Group>
          <Stack.Group
            screenOptions={{
              headerShown: true,
              presentation: "formSheet",
              headerLargeTitle: false,
            }}
          >
            <Stack.Screen
              component={Add}
              name="Add"
              options={{
                title: "Add New Item",
              }}
            />
            <Stack.Screen component={ItemEdit} name="Edit" />
            <Stack.Screen
              component={SwitchAccounts}
              name="SwitchAccounts"
              options={{
                title: "Switch Accounts",
              }}
            />
          </Stack.Group>
          <Stack.Screen
            component={Settings}
            name="Settings"
            options={{
              headerShown: true,
              headerLargeTitle: true,
            }}
          />
        </>
      ) : null}
    </Stack.Navigator>
  );
}
