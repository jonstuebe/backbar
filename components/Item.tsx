import Ionicons from "@expo/vector-icons/Ionicons";
import { deleteDoc, doc } from "@firebase/firestore";
import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import Color from "color";
import { parseISO } from "date-fns";
import React, { useMemo } from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import SwipeableItem from "react-native-swipeable-item";
import { iOSColors, iOSUIKit } from "react-native-typography";
import Colors from "../Colors";
import { db } from "../firebase";
import { useNavigation } from "../hooks/useHomeNavigation";
import { BackbarItem, Item as ItemModel } from "../model/item";
import { getItemsQueryKey } from "../queries/useItemsQuery";
import ItemAction from "./ItemAction";

export type AmountType = "deposit" | "withdrawal";

export interface ItemAmountType {
  // currency in cents
  amount: number;
  // needs to be converted from firebase iso string to date
  dateAdded: Date;
  type: AmountType;
}

export interface ItemType {
  id: string;
  title: string;
  // currency in cents
  goal?: number;
  // needs to be converted from firebase iso string to date
  goalDate?: Date;

  amounts: ItemAmountType[];
}

export interface ItemAmountSerializedType
  extends Omit<ItemAmountType, "dateAdded"> {
  dateAdded: string;
}

export interface ItemSerializedType
  extends Omit<ItemType, "goalDate" | "amounts"> {
  goalDate?: string;
  amounts: ItemAmountSerializedType[];
}

export interface ItemProps extends BackbarItem {
  style?: StyleProp<ViewStyle>;
}

export default function Item({ style, ...item }: ItemProps) {
  const client = useQueryClient();
  const { navigate } = useNavigation<"Home">();
  const { colors } = useTheme();

  const { id, name, brand } = item;

  return (
    <View
      style={[
        {
          height: 96,
          overflow: "hidden",
          marginHorizontal: 12,
        },
        style,
      ]}
    >
      <SwipeableItem
        item={{}}
        snapPointsLeft={[108]}
        snapPointsRight={[76]}
        renderUnderlayRight={() => (
          <ItemAction
            placement="start"
            onPress={async () => {
              navigate("Edit", { id });
            }}
            color={colors.primary}
            label="Edit"
          />
        )}
        renderUnderlayLeft={() => (
          <ItemAction
            placement="end"
            onPress={async () => {
              try {
                await deleteDoc(doc(db, "items", id));
                await client.invalidateQueries(["items"]);
              } catch (e) {
                console.log(e);
              }
            }}
            color={iOSColors.red}
            label="Remove"
          />
        )}
      >
        <View
          style={{
            borderColor: Color("white").hsl().darken(0.95).string(),
            borderWidth: 1,
            borderRadius: 24,

            backgroundColor: Color(colors.card).darken(0.2).hsl().string(),
            overflow: "hidden",

            paddingVertical: 20,
            paddingLeft: 20,
            paddingRight: 8,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              allowFontScaling={false}
              style={[
                iOSUIKit.title3EmphasizedWhite,
                {
                  letterSpacing: -0.45,
                  fontSize: 18,
                  marginBottom: 4,
                  color: Color("#ffffff").hsl().darken(0.1).string(),
                },
              ]}
            >
              {name}
            </Text>
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.border,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  iOSUIKit.caption2,
                  {
                    fontSize: 14,
                    lineHeight: 16,
                    color: Color("#ffffff").hsl().darken(0.3).string(),
                    letterSpacing: -0.2,
                  },
                ]}
              >
                {brand}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Pressable
              style={{ marginRight: 4 }}
              hitSlop={4}
              onPress={async () => {
                await ItemModel.decreaseStock(item);
                await client.invalidateQueries(getItemsQueryKey());
              }}
            >
              <Ionicons
                name="remove-circle"
                size={24}
                color={Colors.darkGray}
              />
            </Pressable>
            <Text
              style={[
                iOSUIKit.bodyEmphasizedWhite,
                {
                  marginRight: 4,
                },
              ]}
            >
              {item.quantityInStock}
            </Text>
            <Pressable
              hitSlop={4}
              onPress={async () => {
                await ItemModel.increaseStock(item);
                await client.invalidateQueries(getItemsQueryKey());
              }}
            >
              <Ionicons name="add-circle" size={24} color={Colors.darkGray} />
            </Pressable>
          </View>
        </View>
      </SwipeableItem>
    </View>
  );
}
