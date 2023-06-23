import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Cell, Section, TableView } from "react-native-tableview-simple";
import { iOSColors } from "react-native-typography";

import { useNavigation } from "../hooks/useHomeNavigation";
import { useRoute } from "../hooks/useRoute";

import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Colors from "../Colors";
import { Stepper } from "../components/Stepper";
import { emitter } from "../emitter";
import { addSchema, BackbarBrand, brands, Item } from "../model/item";
import { getItemsQueryKey } from "../queries/useItemsQuery";

type FormFieldNames =
  | "name"
  | "brand"
  | "quantity"
  | "quantityInStock"
  | "lowStockThreshold";

type FormErrors = Partial<Record<FormFieldNames, boolean>>;

export default function Add() {
  const { setOptions, goBack } = useNavigation<"Add">();
  const { params } = useRoute<"Add">();
  const client = useQueryClient();

  const [errors, setErrors] = useState<FormErrors>({});
  const [name, setName] = useState<string | undefined>();
  const [brand, setBrand] = useState<BackbarBrand | undefined>();
  const [quantity, setQuantity] = useState<number>(0);
  const [quantityInStock, setQuantityInStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const response = await addSchema.parseAsync({
        name,
        brand,
        quantity,
        quantityInStock,
        lowStockThreshold,
      });

      setErrors({});

      await Item.create({
        name: response.name,
        brand: response.brand,
        quantity: response.quantity,
        quantityInStock: response.quantityInStock,
        lowStockThreshold: response.lowStockThreshold,
      });

      emitter.emit("confetti");
      await client.invalidateQueries(getItemsQueryKey());
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
  }, [name, brand, quantity, quantityInStock, lowStockThreshold]);

  useLayoutEffect(() => {
    setOptions({
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
  }, [params, goBack, onSubmit]);

  return (
    <>
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
              title="Quantity In Stock"
              cellAccessoryView={
                <Stepper
                  value={quantityInStock}
                  onChange={setQuantityInStock}
                  minValue={0}
                />
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
    </>
  );
}

const styles = StyleSheet.create({
  cellText: {
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#aeaeae",
  },
});
