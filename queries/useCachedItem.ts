import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { BackbarItem } from "../model/item";
import { getItemsQueryKey } from "./useItemsQuery";

export function useCachedItem(id: string) {
  const queryClient = useQueryClient();

  return useMemo<BackbarItem | undefined>(() => {
    const items = queryClient.getQueryData<BackbarItem[]>(getItemsQueryKey());
    return items ? items.find((item) => item.id === id) : undefined;
  }, [queryClient, id]);
}
