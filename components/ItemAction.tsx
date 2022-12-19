import { Pressable, Text, View } from "react-native";
import { useSwipeableItemParams } from "react-native-swipeable-item";
import { iOSUIKit } from "react-native-typography";

export default function ItemAction({
  label,
  onPress,
  color,
  placement,
}: {
  label: string;
  onPress: () => Promise<void>;
  color: string;
  placement: "start" | "end";
}) {
  const { close } = useSwipeableItemParams();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: `flex-${placement}`,
        height: 90,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: color,
      }}
    >
      <Pressable
        style={{
          height: "100%",
          flexDirection: "row",
          paddingHorizontal: 24,
          alignItems: "center",
          backgroundColor: color,
        }}
        onPress={async () => {
          await onPress();
          close();
        }}
      >
        <Text
          allowFontScaling={false}
          style={[
            iOSUIKit.title3EmphasizedWhite,
            { letterSpacing: -0.45, fontSize: 16 },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
