import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "@firebase/auth";
import { useTheme } from "@react-navigation/native";
import Color from "color";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import { iOSUIKit } from "react-native-typography";
import { z } from "zod";
import Colors from "../Colors";

import { auth } from "../firebase";
import { useNavigation } from "../hooks/useHomeNavigation";

const schema = z.object({
  email: z.string().email(),
});

export default function ForgotPassword() {
  const { colors } = useTheme();
  const { navigate, goBack } = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = useMemo(
    () => schema.safeParse({ email, password, passwordConfirm }).success,
    [email, password, passwordConfirm]
  );
  const onSubmit = useCallback(
    async ({ email }: { email: string }) => {
      setIsSubmitting(true);

      try {
        const response = await sendPasswordResetEmail(auth, email);
        goBack();
      } catch (e) {
        console.log(e);
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
          Reset Password
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
          onPress={() => onSubmit({ email })}
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
            {isSubmitting ? "Sending Reset Email..." : "Send Reset Email"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
