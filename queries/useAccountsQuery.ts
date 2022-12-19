import { useQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";

export const getAccountsQueryKey = () => ["accounts"];

export const useAccountsQuery = () => {
  return useQuery(getAccountsQueryKey(), async () => {
    const accounts = await SecureStore.getItemAsync("accounts");

    if (accounts !== null) {
      const accountsObj = JSON.parse(accounts) as Record<string, string>;

      return Object.keys(accountsObj).map((key) => {
        return {
          email: key,
          password: accountsObj[key],
        };
      });
    }

    return undefined;
  });
};
