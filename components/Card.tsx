import { useTheme } from "@react-navigation/native";
import Color from "color";
import { MotiText } from "moti";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { iOSUIKit } from "react-native-typography";
import Colors from "../Colors";

export interface CardProps {
  icon: JSX.Element;
  label: string;
  value: string | number;
  disabled?: boolean;
  onPress: VoidFunction;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  icon,
  label,
  disabled,
  value,
  onPress,
  style,
}: CardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? Color(Colors.darkGray).alpha(0.35).string()
            : colors.card,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          opacity: disabled ? 0.8 : undefined,
        },
        style,
      ]}
    >
      <View>
        <View
          style={{
            marginBottom: 8,
          }}
        >
          {icon}
        </View>
        <MotiText
          style={[
            iOSUIKit.footnoteEmphasized,
            {
              color: Colors.darkGray,
            },
          ]}
        >
          {label}
        </MotiText>
      </View>
      <MotiText style={[iOSUIKit.title3EmphasizedWhite]}>{value}</MotiText>
    </Pressable>
  );
}
