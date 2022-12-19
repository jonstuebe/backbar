import {
  useNavigation as useRNNavigation,
  NavigationProp,
} from "@react-navigation/native";

import { StackParamList } from "../navigators/Stack";

export function useNavigation<TScreen extends keyof StackParamList>() {
  return useRNNavigation<NavigationProp<StackParamList, TScreen>>();
}
