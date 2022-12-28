import { useTheme } from "@react-navigation/native";
import Color from "color";
import { MotiView } from "moti";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import Confetti from "react-native-confetti";
import { RefreshControl, TextInput } from "react-native-gesture-handler";
import { Portal } from "react-native-portalize";
import { SafeAreaView } from "react-native-safe-area-context";
import { iOSColors, iOSUIKit } from "react-native-typography";
import Fuse from "fuse.js";
import Ionicons from "@expo/vector-icons/Ionicons";

import Colors from "../Colors";

import { useConfetti } from "../hooks/useConfetti";
import { useNavigation } from "../hooks/useHomeNavigation";

import { useItemsQuery } from "../queries/useItemsQuery";

import { emitter } from "../emitter";
import { Card } from "../components/Card";
import Item from "../components/Item";
import { useIsRefreshingQuery } from "../hooks/useIsRefreshingQuery";
import { BackbarItem } from "../model/item";
import { Easing } from "react-native-reanimated";

function isLowStock(item: BackbarItem): boolean {
  return isOutOfStock(item)
    ? false
    : item.quantityInStock <= item.lowStockThreshold;
}

function isOutOfStock(item: BackbarItem): boolean {
  return item.quantityInStock === 0;
}

export default function Home() {
  const { navigate } = useNavigation<"Home">();
  const { colors } = useTheme();

  const { confettiRef, startConfetti } = useConfetti();
  const itemsQuery = useItemsQuery();
  const { isRefreshing, onRefresh } = useIsRefreshingQuery(itemsQuery);

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const [filter, setFilter] = useState<
    "low_stock" | "out_of_stock" | undefined
  >(undefined);

  const lowStockValue = useMemo(
    () => itemsQuery.data?.filter(isLowStock).length,
    [itemsQuery.data]
  );
  const outOfStockValue = useMemo(
    () => itemsQuery.data?.filter(isOutOfStock).length,
    [itemsQuery.data]
  );
  const data = useMemo(() => {
    let data = itemsQuery.data ?? [];

    if (searchQuery) {
      const fuse = new Fuse(data, {
        threshold: 0.8,
        keys: ["name"],
      });

      const r = fuse.search(searchQuery);
      data = r.map((r) => r.item);
    }

    if (filter) {
      switch (filter) {
        case "low_stock":
          return data.filter(isLowStock);
        case "out_of_stock":
          return data.filter(isOutOfStock);
        default:
          return data;
      }
    }

    return data;
  }, [filter, itemsQuery.data, searchQuery]);

  useEffect(() => {
    emitter.on("confetti", startConfetti);

    return () => {
      emitter.off("confetti");
    };
  }, [startConfetti]);

  return (
    <>
      <SafeAreaView mode="padding" style={{ flex: 1, paddingHorizontal: 16 }}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 550,
          }}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              iOSUIKit.largeTitleEmphasizedWhite,
              {
                marginTop: 16,
                marginBottom: 16,
              },
            ]}
          >
            Dashboard
          </Text>
          <Pressable
            onPress={() => navigate("Settings")}
            style={{
              backgroundColor: colors.card,
              borderRadius: 32 / 2,

              width: 32,
              height: 32,

              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="ios-cog"
              size={20}
              style={{
                marginLeft: 2,
              }}
              color={Color("#fff").hsl().darken(0.6).string()}
            />
          </Pressable>
        </MotiView>
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: -8,
            marginBottom: 16,
          }}
        >
          <Card
            icon={
              <Ionicons name="warning" size={20} color={iOSColors.orange} />
            }
            label="Low Stock"
            value={lowStockValue ?? 0}
            disabled={lowStockValue === 0}
            onPress={() => {
              setFilter("low_stock");
            }}
            style={{
              flex: 1 / 2,
              marginHorizontal: 8,
            }}
          />
          <Card
            icon={
              <Ionicons name="warning" size={20} color={colors.notification} />
            }
            label="Out of Stock"
            value={outOfStockValue ?? 0}
            disabled={outOfStockValue === 0}
            onPress={() => {
              setFilter("out_of_stock");
            }}
            style={{
              flex: 1 / 2,
              marginHorizontal: 8,
            }}
          />
        </View>
        <MotiView
          from={{ opacity: 0, transform: [{ translateY: 8, scale: 0.7 }] }}
          animate={{ opacity: 1, transform: [{ translateY: 0, scale: 1 }] }}
          transition={{
            type: "timing",
            duration: 350,
          }}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,

            position: "relative",
          }}
        >
          {data?.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                justifyContent: "center",
              }}
            >
              <Text style={[iOSUIKit.title3White]}>No Items</Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  overflow: "hidden",
                  height: 54,

                  borderTopRightRadius: 12,
                  borderTopLeftRadius: 12,

                  backgroundColor: Color(colors.card)
                    .darken(0.2)
                    .hsl()
                    .string(),
                }}
              >
                <TextInput
                  placeholder="Search"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    flex: 1,
                    paddingRight: 8,
                    color: Colors.darkGray,
                  }}
                />
                {searchQuery ? (
                  <Pressable
                    hitSlop={6}
                    onPress={() => setSearchQuery(undefined)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.darkGray}
                      style={{ marginRight: 4 }}
                    />
                  </Pressable>
                ) : null}
              </View>
              {filter ? (
                <MotiView
                  from={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: 54,
                  }}
                  transition={{
                    type: "timing",
                    duration: 350,
                  }}
                >
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",

                      width: "100%",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      overflow: "hidden",
                      height: 54,

                      borderTopRightRadius: 12,
                      borderTopLeftRadius: 12,

                      backgroundColor: Color(colors.card)
                        .darken(0.2)
                        .hsl()
                        .string(),
                    }}
                    onPress={() => setFilter(undefined)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.darkGray}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[iOSUIKit.bodyEmphasizedWhite]}>
                      Clear Filter
                    </Text>
                  </Pressable>
                </MotiView>
              ) : undefined}
              <ScrollView
                style={{
                  height: "100%",
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 12,
                }}
                refreshControl={
                  <RefreshControl
                    onRefresh={onRefresh}
                    refreshing={isRefreshing}
                  />
                }
              >
                {data?.map((item, index) => (
                  <Item
                    key={item.id}
                    {...item}
                    style={{
                      marginBottom: data?.length === index + 1 ? undefined : 12,
                    }}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </MotiView>

        <MotiView
          from={{ opacity: 0, transform: [{ translateY: 200 }] }}
          animate={{ opacity: 1, transform: [{ translateY: 0 }] }}
          transition={{
            type: "timing",
            duration: 750,
          }}
          style={{
            marginTop: 12,
          }}
        >
          <Pressable
            style={{
              alignItems: "center",
              justifyContent: "center",

              width: "100%",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 12,

              backgroundColor: Colors.blue,
            }}
            onPress={() => navigate("Add")}
          >
            <Text
              allowFontScaling={false}
              style={[iOSUIKit.bodyEmphasizedWhite, { fontSize: 20 }]}
            >
              Add
            </Text>
          </Pressable>
        </MotiView>
      </SafeAreaView>
      <Portal>
        <Confetti ref={confettiRef} confettiCount={100} />
      </Portal>
    </>
  );
}
