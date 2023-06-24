import { useQuery } from "@tanstack/react-query";
import {
  query,
  collection,
  where,
  getDocs,
  orderBy,
} from "@firebase/firestore";

import { auth, db } from "../firebase";
import {
  BackbarBrand,
  BackbarItem,
  BackbarItemHistoryChange,
} from "../model/item";

export const getItemsQueryKey = () => ["items"];
export function useItemsQuery() {
  return useQuery<BackbarItem[]>({
    queryKey: getItemsQueryKey(),
    queryFn: async () => {
      const user = auth.currentUser;
      const q = query(
        collection(db, "items"),
        where("uid", "==", user?.uid),
        orderBy("name", "asc")
      );
      const snapshots = await getDocs(q);

      const items: BackbarItem[] = [];
      snapshots.docs.forEach((item) => {
        const data = item.data();

        items.push({
          id: item.id,
          uid: data.uid,
          name: data.name as string,
          brand: data.brand as BackbarBrand,
          quantity: data.quantity as number,
          quantityInStock: data.quantityInStock as number,
          lowStockThreshold: data.lowStockThreshold as number,
          dateCreated: data.dateCreated.toDate() as Date,
          changes: data.changes.map((change: any) => ({
            ...change,
            date: change.date.toDate() as Date,
          })) as BackbarItemHistoryChange[],
        });
      });

      return items;
    },
  });
}
