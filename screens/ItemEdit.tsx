import Ionicons from "@expo/vector-icons/Ionicons";
import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import { iOSColors } from "react-native-typography";
import { z } from "zod";

import Colors from "../Colors";
import { Stepper } from "../components/Stepper";

import { useNavigation } from "../hooks/useHomeNavigation";
import { useRoute } from "../hooks/useRoute";
import { BackbarBrand, brands, editSchema, Item } from "../model/item";
import { useCachedItem } from "../queries/useCachedItem";
import { getItemsQueryKey } from "../queries/useItemsQuery";
import { ScrollView } from "react-native-gesture-handler";

type FormFieldNames = "name" | "brand" | "quantity" | "lowStockThreshold";

type FormErrors = Partial<Record<FormFieldNames, boolean>>;

export default function ItemEdit() {
  const { setOptions, goBack } = useNavigation<"Edit">();
  const queryClient = useQueryClient();
  const { params } = useRoute<"Edit">();

  const item = useCachedItem(params.id);

  const [errors, setErrors] = useState<FormErrors>({});
  const [name, setName] = useState<string | undefined>(() => item?.name);
  const [brand, setBrand] = useState<BackbarBrand | undefined>(item?.brand);
  const [quantity, setQuantity] = useState<number>(item?.quantity ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    item?.lowStockThreshold ?? 0
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const response = await editSchema.parseAsync({
        name,
        brand,
        quantity,
        lowStockThreshold,
      });

      setErrors({});

      await Item.edit({
        id: params.id,
        name: response.name,
        brand: response.brand,
        quantity: response.quantity,
        lowStockThreshold: response.lowStockThreshold,
      });

      await queryClient.invalidateQueries(getItemsQueryKey());
      setIsSubmitting(false);
      goBack();
    } catch (e) {
      if (e instanceof z.ZodError) {
        for (const issue of e.issues) {
          for (const fieldName of issue.path) {
            setErrors((prev) => {
              prev[fieldName as FormFieldNames] = true;
              return prev;
            });
          }
        }
        setIsSubmitting(false);
        return;
      }
    }
  }, [name, brand, quantity, lowStockThreshold, goBack]);

  useLayoutEffect(() => {
    setOptions({
      title: item ? `${item.name} - ${item.brand}` : "Edit",
      headerLeft: () => (
        <Pressable onPress={() => goBack()}>
          <Ionicons name="close" color={iOSColors.gray} size={24} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={onSubmit}>
          <Ionicons name="checkmark" color={iOSColors.green} size={24} />
        </Pressable>
      ),
    });
  }, [item, params, goBack, onSubmit]);

  return (
    <ScrollView keyboardDismissMode="interactive">
      <TableView appearance="dark">
        <Section hideSurroundingSeparators>
          <Cell
            title="Name"
            cellAccessoryView={
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Item name"
                  placeholderTextColor={
                    errors.name ? Colors.error : Colors.darkGray
                  }
                  autoComplete="off"
                  autoFocus
                  keyboardAppearance="dark"
                  value={name}
                  onChangeText={setName}
                  style={[styles.cellText, { flex: 1, textAlign: "right" }]}
                />
              </View>
            }
          />
          <Cell
            title="Brand"
            cellAccessoryView={
              <MenuView
                title="Select Brand"
                onPressAction={({ nativeEvent }) => {
                  setBrand(nativeEvent.event as BackbarBrand);
                }}
                actions={brands.map((b) => ({
                  id: b,
                  title: b,
                  state: b === brand ? "on" : "off",
                }))}
                shouldOpenOnLongPress={false}
              >
                <Text
                  style={[
                    {
                      color: errors.brand
                        ? Colors.error
                        : brand
                        ? undefined
                        : Colors.darkGray,
                    },
                    styles.cellText,
                  ]}
                >
                  {brand ?? "No Brand Selected"}
                </Text>
              </MenuView>
            }
          />
          <Cell
            title="Full Stock Quantity"
            cellAccessoryView={
              <Stepper value={quantity} onChange={setQuantity} minValue={0} />
            }
          />
          <Cell
            title="Low Stock Threshold"
            cellAccessoryView={
              <Stepper
                value={lowStockThreshold}
                onChange={setLowStockThreshold}
                minValue={0}
              />
            }
          />
        </Section>
      </TableView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cellText: {
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#aeaeae",
  },
});
