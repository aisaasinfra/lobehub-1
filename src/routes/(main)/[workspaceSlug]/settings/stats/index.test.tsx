/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import WorkspaceStatsSetting from './index';

const useFetchWorkspaceMembersMock = vi.hoisted(() => vi.fn());

vi.mock(
  '@/business/client/hooks/useFetchWorkspaceMembers',
  () => ({
    useFetchWorkspaceMembers: useFetchWorkspaceMembersMock,
  }),
  { virtual: true },
);

vi.mock('@/routes/(main)/settings/stats/features/overview/WorkspaceWelcome', () => ({
  default: () => <div>Workspace Welcome</div>,
}));

vi.mock('@/store/workspace', () => ({
  useWorkspaceStore: (selector: (state: unknown) => unknown) =>
    selector({
      members: [
        {
          user: {
            avatar: 'https://example.com/avatar.png',
            email: 'ada@example.com',
            fullName: 'Ada Lovelace',
          },
          userId: 'user-1',
        },
      ],
    }),
  workspaceSelectors: {
    members: (state: { members: unknown[] }) => state.members,
  },
}));

vi.mock('@/routes/(main)/settings/stats', () => ({
  default: ({
    resolveUser,
  }: {
    resolveUser: (userId: string) => { avatar?: string | null; name: string };
  }) => {
    const user = resolveUser('user-1');

    return (
      <div>
        <span>{user.name}</span>
        <span>{user.avatar}</span>
      </div>
    );
  },
}));

describe('WorkspaceStatsSetting', () => {
  it('fetches workspace members for user display resolution', () => {
    render(<WorkspaceStatsSetting />);

    expect(useFetchWorkspaceMembersMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/avatar.png')).toBeInTheDocument();
  });
});
