import { UseQueryResult } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export function useIsRefreshingQuery<TQuery = any>(
  query: UseQueryResult<TQuery>
) {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const onRefresh = useCallback(() => {
    query.refetch();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  }, [query]);

  return {
    isRefreshing,
    onRefresh,
  };
}
