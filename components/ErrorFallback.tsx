import { Pressable, Text, View } from "react-native";
import RNRestart from "react-native-restart";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { iOSUIKit } from "react-native-typography";
import Colors from "../Colors";

export function ErrorFallback() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          // alignItems: "center",
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        <View>
          <Text
            style={[
              iOSUIKit.largeTitleEmphasizedWhite,
              { letterSpacing: -0.6 },
            ]}
          >
            Uh oh
          </Text>
          <Text
            style={[
              iOSUIKit.title3White,
              {
                marginBottom: 16,
              },
            ]}
          >
            Something went wrong
          </Text>
        </View>
        <Pressable
          onPress={() => {
            RNRestart.restart();
          }}
          style={{
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 12,

            backgroundColor: Colors.blue,
          }}
        >
          <Text style={[iOSUIKit.bodyEmphasizedWhite, { fontSize: 20 }]}>
            Try again
          </Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
