import Color from "color";
import { iOSColors } from "react-native-typography";

const blue = "#007bff";
const darkGray = Color(iOSColors.gray).darken(0.2).hsl().string();
const error = Color(iOSColors.red).hsl().fade(0.4).string();

export default {
  blue,
  darkGray,
  error,
};
