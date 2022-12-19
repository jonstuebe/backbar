import { signOut } from "@firebase/auth";
import { ScrollView } from "react-native-gesture-handler";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import * as SecureStore from "expo-secure-store";

import { auth } from "../firebase";
import { useNavigation } from "../hooks/useHomeNavigation";

async function removeAccountAndSignOut() {
  try {
    const email = auth.currentUser?.email as string;
    const accounts = await SecureStore.getItemAsync("accounts");

    if (accounts !== null) {
      const accountsObj = JSON.parse(accounts);
      if (accountsObj[email]) {
        delete accountsObj[email];
        await SecureStore.setItemAsync("accounts", JSON.stringify(accountsObj));
      }
    }

    await signOut(auth);
  } catch {
    //
  }
}

export default function Settings() {
  const { navigate } = useNavigation<"Settings">();

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
          <Cell
            title="Switch Accounts"
            accessory="DisclosureIndicator"
            onPress={() => {
              navigate("SwitchAccounts");
            }}
          />
          <Cell
            title="Logout"
            accessory="DisclosureIndicator"
            onPress={() => {
              removeAccountAndSignOut()
                .then(() => {
                  //
                })
                .catch(() => {
                  //
                });
            }}
          />
        </Section>
      </TableView>
    </ScrollView>
  );
}
