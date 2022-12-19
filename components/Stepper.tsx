import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { iOSColors, iOSUIKit } from "react-native-typography";

export function Stepper({
  value,
  onChange,
  minValue = 0,
}: {
  value: number;
  onChange: (num: number) => void;
  minValue?: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2b2c",
        borderRadius: 8,
        paddingVertical: 2,
        paddingHorizontal: 6,
      }}
    >
      <Pressable
        style={{ paddingHorizontal: 2 }}
        hitSlop={4}
        onPress={() => {
          const newValue = value - 1;

          if (newValue >= minValue) {
            onChange(newValue);
          }
        }}
      >
        {({ pressed }) => (
          <Ionicons
            name="remove-outline"
            size={24}
            color={pressed ? iOSColors.blue : "white"}
          />
        )}
      </Pressable>
      <Text
        style={[
          iOSUIKit.bodyEmphasizedWhite,
          { fontSize: 14, marginHorizontal: 4 },
        ]}
      >
        {value}
      </Text>
      <Pressable
        style={{ paddingHorizontal: 2 }}
        hitSlop={4}
        onPress={() => onChange(value + 1)}
      >
        {({ pressed }) => (
          <Ionicons
            name="add-outline"
            size={24}
            color={pressed ? iOSColors.blue : "white"}
          />
        )}
      </Pressable>
    </View>
  );
}
