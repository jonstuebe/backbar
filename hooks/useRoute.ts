import { useRoute as useRNRoute, RouteProp } from "@react-navigation/native";

import { StackParamList } from "../navigators/Stack";

export function useRoute<TScreen extends keyof StackParamList>() {
  return useRNRoute<RouteProp<StackParamList, TScreen>>();
}
