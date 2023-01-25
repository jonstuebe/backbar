import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "@firebase/firestore";
import { z } from "zod";
import { auth, db } from "../firebase";

export const brands = [
  "Rhapsody",
  "Shades EQ",
  "Faction8",
  "High Speed Toners",
  "Blonde Voyage Powder Lightener",
  "Blonde Voyage Clay Lightener",
] as const;
export type BackbarBrand = typeof brands[number];

export type BackbarItemHistoryChangeType =
  | "increasedQuantity"
  | "decreasedQuantity";
export interface BackbarItemHistoryChange {
  changeType: BackbarItemHistoryChangeType;
  value: number;
  previousValue: number;
  date: Date;
}

export interface BackbarItem {
  id: string;
  uid: string;
  name: string;
  brand: BackbarBrand;
  quantity: number;
  quantityInStock: number;
  lowStockThreshold: number;
  dateCreated: Date;
  changes: BackbarItemHistoryChange[];
}

export const addSchema = z.object({
  name: z.string(),
  brand: z.enum(brands),
  quantity: z.number().min(1),
  quantityInStock: z.number().min(0),
  lowStockThreshold: z.number().min(0),
});

export const editSchema = z.object({
  name: z.string(),
  brand: z.enum(brands),
  quantity: z.number().min(1),
  lowStockThreshold: z.number().min(0),
});

async function create(
  item: Omit<BackbarItem, "id" | "changes" | "dateCreated" | "uid">
) {
  const uid = auth.currentUser?.uid;
  return addDoc(collection(db, "items"), {
    ...item,
    uid,
    dateCreated: Timestamp.now(),
    changes: [],
  });
}

async function decreaseStock(item: BackbarItem) {
  const quantityInStock =
    item.quantityInStock === 0 ? 0 : item.quantityInStock - 1;

  await updateDoc(doc(db, "items", item.id), {
    quantityInStock,
    changes: [
      ...item.changes,
      {
        changeType: "decreasedQuantity",
        date: Timestamp.now(),
        value: quantityInStock,
        previousValue: item.quantityInStock,
      },
    ],
  } as Partial<BackbarItem>);
}

async function increaseStock(item: BackbarItem) {
  const quantityInStock = item.quantityInStock + 1;

  await updateDoc(doc(db, "items", item.id), {
    quantityInStock,
    changes: [
      ...item.changes,
      {
        changeType: "decreasedQuantity",
        date: Timestamp.now(),
        value: quantityInStock,
        previousValue: item.quantityInStock,
      },
    ],
  } as Partial<BackbarItem>);
}

async function edit(
  item: Partial<
    Pick<BackbarItem, "brand" | "lowStockThreshold" | "quantity" | "name">
  > & { id: string }
) {
  await updateDoc(doc(db, "items", item.id), {
    name: item.name,
    brand: item.brand,
    lowStockThreshold: item.lowStockThreshold,
    quantity: item.quantity,
  } as Partial<BackbarItem>);
}

export const Item = {
  create,
  edit,
  decreaseStock,
  increaseStock,
};
