import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import Color from "color";
import Fuse from "fuse.js";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Confetti from "react-native-confetti";
import { RefreshControl, TextInput } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { Portal } from "react-native-portalize";
import { SafeAreaView } from "react-native-safe-area-context";
import { iOSColors, iOSUIKit } from "react-native-typography";

import Colors from "../Colors";

import { useConfetti } from "../hooks/useConfetti";
import { useNavigation } from "../hooks/useHomeNavigation";

import { useItemsQuery } from "../queries/useItemsQuery";

import { MenuView } from "@react-native-menu/menu";
import { Card } from "../components/Card";
import Item from "../components/Item";
import { emitter } from "../emitter";
import { useIsRefreshingQuery } from "../hooks/useIsRefreshingQuery";
import { BackbarBrand, BackbarItem, brands } from "../model/item";

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
  const [brandsSelected, setBrandsSelected] = useState<
    BackbarBrand[] | undefined
  >(undefined);

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

    if (brandsSelected) {
      data = data.filter((item) => brandsSelected.includes(item.brand));
    }

    if (searchQuery) {
      const fuse = new Fuse(data, {
        threshold: 0.49,
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
  }, [brandsSelected, filter, itemsQuery.data, searchQuery]);

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
            Backbar
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
              name="ellipsis-vertical"
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
            active={filter === "low_stock"}
            onPress={() => {
              if (filter === "low_stock") {
                setFilter(undefined);
              } else {
                setFilter("low_stock");
              }
              setSearchQuery(undefined);
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
            active={filter === "out_of_stock"}
            onPress={() => {
              if (filter === "out_of_stock") {
                setFilter(undefined);
              } else {
                setFilter("out_of_stock");
              }
              setSearchQuery(undefined);
            }}
            style={{
              flex: 1 / 2,
              marginHorizontal: 8,
            }}
          />
        </View>
        <MenuView
          onPressAction={({ nativeEvent: { event: id } }) => {
            if (id === "all") {
              setBrandsSelected(undefined);
            } else {
              setBrandsSelected((prev) => {
                if (prev) {
                  if (prev.includes(id as BackbarBrand)) {
                    if (prev.filter((b) => b !== id).length === 0) {
                      return undefined;
                    } else {
                      return prev.filter((b) => b !== id);
                    }
                  }
                  return [...prev, id as BackbarBrand];
                }
                return [id as BackbarBrand];
              });
            }
          }}
          actions={[
            {
              id: "all",
              title: "View All",
              state: brandsSelected === undefined ? "on" : "off",
            },
            ...brands.map((brand) => ({
              id: brand,
              title: brand,
              state: (brandsSelected?.includes(brand) ? "on" : "off") as
                | "on"
                | "off",
            })),
          ]}
        >
          <Pressable
            style={{
              backgroundColor: colors.card,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={[iOSUIKit.footnoteEmphasized, { color: Colors.darkGray }]}
            >
              Brand
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={20}
              color={Colors.darkGray}
            />
          </Pressable>
        </MenuView>
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
          {itemsQuery.isLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" />
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
                  alignItems: "center",
                }}
              >
                <Ionicons name="search" size={20} color={Colors.darkGray} />
                <TextInput
                  placeholder="Search"
                  autoComplete="off"
                  autoCorrect={false}
                  autoCapitalize="none"
                  importantForAutofill="no"
                  placeholderTextColor={Color(Colors.darkGray)
                    .alpha(0.8)
                    .rgb()
                    .toString()}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    flex: 1,
                    paddingHorizontal: 8,
                    color: Colors.darkGray,
                  }}
                />
                {searchQuery ? (
                  <Pressable
                    hitSlop={6}
                    onPress={() => setSearchQuery(undefined)}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={Colors.darkGray}
                      style={{ marginRight: 4 }}
                    />
                  </Pressable>
                ) : null}
              </View>
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingBottom: 12,
                }}
              >
                <FlashList
                  estimatedItemSize={88}
                  keyboardShouldPersistTaps="handled"
                  refreshControl={
                    <RefreshControl
                      onRefresh={onRefresh}
                      refreshing={isRefreshing}
                    />
                  }
                  data={data}
                  ListEmptyComponent={() => (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        paddingVertical: 16,
                      }}
                    >
                      <Text style={[iOSUIKit.title3EmphasizedWhite]}>
                        No Items Found
                      </Text>
                    </View>
                  )}
                  renderItem={({ item, index }) => {
                    return (
                      <Item
                        key={item.id}
                        {...item}
                        style={{
                          marginBottom:
                            data?.length === index + 1 ? undefined : 12,
                        }}
                      />
                    );
                  }}
                />
              </View>
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
