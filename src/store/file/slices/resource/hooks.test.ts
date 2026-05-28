import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mutate } from '@/libs/swr';

import { revalidateResources } from './hooks';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  queryParams: {
    category: 'audios',
    parentId: null,
    showFilesInKnowledgeBase: false,
  },
}));

vi.mock('@/libs/swr', () => ({
  mutate: mocks.mutate,
  useClientDataSWR: vi.fn(),
}));

vi.mock('../../store', () => ({
  useFileStore: {
    getState: () => ({
      queryParams: mocks.queryParams,
    }),
  },
}));

describe('revalidateResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches workspace-scoped resource SWR keys', async () => {
    await revalidateResources();

    const [matcher] = vi.mocked(mutate).mock.calls[0] as [(key: unknown) => boolean];

    expect(matcher).toEqual(expect.any(Function));
    expect(matcher(['SWR_RESOURCES', mocks.queryParams])).toBe(true);
    expect(matcher(['SWR_RESOURCES', mocks.queryParams, 'workspace-1'])).toBe(true);
    expect(matcher(['OTHER_KEY', mocks.queryParams, 'workspace-1'])).toBe(false);
  });
});
