import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, signOut } from "@firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import { iOSColors } from "react-native-typography";

import { auth } from "../firebase";
import { useNavigation } from "../hooks/useHomeNavigation";
import { useAccountsQuery } from "../queries/useAccountsQuery";
import { getItemsQueryKey } from "../queries/useItemsQuery";

export default function SwitchAccounts() {
  const { setOptions, goBack, navigate } = useNavigation<"SwitchAccounts">();
  const queryClient = useQueryClient();
  const query = useAccountsQuery();

  useLayoutEffect(() => {
    setOptions({
      headerLeft: () => (
        <Pressable onPress={() => goBack()}>
          <Ionicons name="close" color={iOSColors.gray} size={24} />
        </Pressable>
      ),
    });
  }, [goBack]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      style={{ flex: 1 }}
    >
      <TableView
        appearance="dark"
        style={{
          marginHorizontal: 16,
        }}
      >
        <Section roundedCorners hideSurroundingSeparators>
          {query.data ? (
            <>
              {query.data.map(({ email, password }, index) => {
                return (
                  <Cell
                    key={index}
                    title={email}
                    accessory="DisclosureIndicator"
                    onPress={() => {
                      signInWithEmailAndPassword(auth, email, password).then(
                        () => {
                          queryClient.invalidateQueries(getItemsQueryKey());
                          navigate("Home");
                        }
                      );
                    }}
                  />
                );
              })}
              <Cell
                title="Add Account"
                accessory="DisclosureIndicator"
                onPress={() => {
                  signOut(auth).catch(() => {});
                }}
              />
            </>
          ) : (
            <ActivityIndicator size="large" />
          )}
        </Section>
      </TableView>
    </ScrollView>
  );
}
