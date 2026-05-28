import { isEqual } from 'es-toolkit';
import { shallow } from 'zustand/shallow';

import {
  getActiveWorkspaceId,
  useActiveWorkspaceId,
} from '@/business/client/hooks/useActiveWorkspaceId';
import { mutate, useClientDataSWR } from '@/libs/swr';
import { resourceService } from '@/services/resource';
import type { ResourceQueryParams } from '@/types/resource';

import { useFileStore } from '../../store';
import { mergeServerResourcesWithOptimistic } from './utils';

const SWR_KEY_RESOURCES = 'SWR_RESOURCES';
type ResourceSWRKey = [typeof SWR_KEY_RESOURCES, ResourceQueryParams, string | null];

const isResourceSWRKey = (
  key: unknown,
  queryParams: ResourceQueryParams,
  workspaceId: string | null,
) => {
  if (!Array.isArray(key)) return false;

  return key[0] === SWR_KEY_RESOURCES && isEqual(key[1], queryParams) && key[2] === workspaceId;
};

/**
 * Revalidate resources with current or specific query params
 * This can be called from outside React components (e.g., store actions)
 */
export const revalidateResources = async (params?: ResourceQueryParams) => {
  const queryParams = params || useFileStore.getState().queryParams;
  const workspaceId = getActiveWorkspaceId();
  if (queryParams) {
    await mutate(
      (key) => isResourceSWRKey(key, queryParams, workspaceId),
      async (currentData) => currentData,
      {
        revalidate: true,
      },
    );
  }
};

/**
 * Custom SWR hook for fetching resources with caching and revalidation
 */
export const useFetchResources = (params: ResourceQueryParams | null, enable: any = true) => {
  const workspaceId = useActiveWorkspaceId();

  return useClientDataSWR(
    enable && params ? ([SWR_KEY_RESOURCES, params, workspaceId] satisfies ResourceSWRKey) : null,
    async ([, queryParams]: ResourceSWRKey) => {
      const response = await resourceService.queryResources({
        ...queryParams,
        limit: queryParams.limit || 50,
        offset: 0,
      });
      return response;
    },
    {
      // SWR configuration for optimal UX
      dedupingInterval: 2000,
      onSuccess: (data: { hasMore: boolean; items: any[]; total?: number }) => {
        const { resourceList, resourceMap } = useFileStore.getState();
        const merged = mergeServerResourcesWithOptimistic(data.items, resourceMap, params);
        const newResourceList = merged.resourceList;
        const newResourceMap = merged.resourceMap;

        // Only update store if data actually changed
        if (!isEqual(newResourceList, resourceList) || !isEqual(newResourceMap, resourceMap)) {
          useFileStore.setState(
            {
              hasMore: data.hasMore,
              offset: data.items.length,
              queryParams: params ?? undefined,
              resourceList: newResourceList,
              resourceMap: newResourceMap,
              total: data.total,
            },
            false,
            'useFetchResources/success',
          );
        }
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );
};

/**
 * Hook to access resource store state
 */
export const useResourceStore = () => {
  return useFileStore(
    (s) => ({
      hasMore: s.hasMore,
      queryParams: s.queryParams,
      resourceList: s.resourceList,
      resourceMap: s.resourceMap,
      total: s.total,
    }),
    shallow,
  );
};
