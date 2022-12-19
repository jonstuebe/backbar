import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { iOSUIKit } from "react-native-typography";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useCallback, useMemo, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { z } from "zod";
import * as SecureStore from "expo-secure-store";

import Colors from "../Colors";
import Color from "color";
import { useNavigation } from "../hooks/useHomeNavigation";
import { auth } from "../firebase";
import { useAccountsQuery } from "../queries/useAccountsQuery";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(20),
});

export default function Login() {
  const { colors } = useTheme();
  const { navigate } = useNavigation();
  const accountsQuery = useAccountsQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = useMemo(
    () => schema.safeParse({ email, password }).success,
    [email, password]
  );

  const onSubmit = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setIsSubmitting(true);

      try {
        await signInWithEmailAndPassword(auth, email, password);
        const curAccounts = await SecureStore.getItemAsync("accounts");
        let accounts: Record<string, string> = {};

        if (curAccounts !== null) {
          accounts = JSON.parse(curAccounts);
        }
        accounts[email] = password;

        await SecureStore.setItemAsync("accounts", JSON.stringify(accounts));
      } catch {
        //
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate]
  );

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        flex: 1,
        marginHorizontal: 32,
      }}
    >
      <ScrollView
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          flex: 1,
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 64,
        }}
      >
        <Text
          style={[iOSUIKit.largeTitleEmphasizedWhite, { letterSpacing: -0.45 }]}
        >
          Backbar
        </Text>
        <TableView
          appearance="dark"
          style={{
            width: "100%",
          }}
        >
          <Section hideSurroundingSeparators roundedCorners>
            <Cell
              title="Email"
              cellAccessoryView={
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder="hello@company.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    keyboardAppearance="dark"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isSubmitting}
                    style={{
                      flex: 1,
                      color: "#fff",
                      textAlign: "right",
                      opacity: isSubmitting ? 0.1 : undefined,
                    }}
                  />
                </View>
              }
            />
            <Cell
              title="Password"
              cellAccessoryView={
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder="Your password"
                    autoComplete="password"
                    keyboardAppearance="dark"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isSubmitting}
                    onSubmitEditing={() => onSubmit({ email, password })}
                    maxLength={20}
                    style={{
                      flex: 1,
                      color: "#fff",
                      textAlign: "right",
                      opacity: isSubmitting ? 0.1 : undefined,
                    }}
                  />
                </View>
              }
            />
          </Section>
        </TableView>
        <Pressable
          disabled={!isValid || isSubmitting}
          style={{
            width: "100%",
            alignItems: "center",
            paddingVertical: 10,
            borderRadius: 10,
            marginBottom: 8,

            backgroundColor: colors.card,
            opacity: isValid ? 1 : 0.8,
          }}
          onPress={() => onSubmit({ email, password })}
        >
          <Text
            style={[
              iOSUIKit.body,
              {
                color: isValid
                  ? Colors.blue
                  : Color(colors.text).hsl().alpha(0.2).string(),
              },
            ]}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Text>
        </Pressable>
      </ScrollView>
      <View>
        <Pressable
          style={{
            width: "100%",
            paddingVertical: 8,
            marginBottom: 8,
          }}
          onPress={() => {
            navigate("ForgotPassword");
          }}
        >
          <Text
            style={[
              iOSUIKit.calloutWhite,
              {
                color: Color("white").darken(0.4).hsl().string(),
                textAlign: "center",
              },
            ]}
          >
            Forgot Password
          </Text>
        </Pressable>
        <Pressable
          style={{
            width: "100%",
            alignItems: "center",
            paddingVertical: 10,
            borderRadius: 10,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          onPress={() => navigate("Register")}
        >
          <Text style={iOSUIKit.bodyWhite}>Register</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
