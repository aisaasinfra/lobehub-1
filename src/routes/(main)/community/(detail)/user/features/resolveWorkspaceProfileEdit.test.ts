import { describe, expect, it } from 'vitest';

import {
  resolveCommunityProfileUsername,
  resolveWorkspaceCommunityProfileRedirect,
  shouldShowWorkspaceProfileEdit,
} from './resolveWorkspaceProfileEdit';

describe('shouldShowWorkspaceProfileEdit', () => {
  it('returns true for the active workspace organization when editing is allowed', () => {
    expect(
      shouldShowWorkspaceProfileEdit({
        canEdit: true,
        marketOrganizationProfile: { accountId: 42 },
        user: { id: 42, type: 'organization' },
      }),
    ).toBe(true);
  });

  it('returns false for personal user profiles', () => {
    expect(
      shouldShowWorkspaceProfileEdit({
        canEdit: true,
        marketOrganizationProfile: { accountId: 42 },
        user: { id: 42, type: 'user' },
      }),
    ).toBe(false);
  });

  it('returns false for a different organization profile', () => {
    expect(
      shouldShowWorkspaceProfileEdit({
        canEdit: true,
        marketOrganizationProfile: { accountId: 42 },
        user: { id: 99, type: 'organization' },
      }),
    ).toBe(false);
  });

  it('returns false when the caller cannot edit the workspace', () => {
    expect(
      shouldShowWorkspaceProfileEdit({
        canEdit: false,
        marketOrganizationProfile: { accountId: 42 },
        user: { id: 42, type: 'organization' },
      }),
    ).toBe(false);
  });
});

describe('resolveCommunityProfileUsername', () => {
  it('uses the workspace organization username in workspace scope', () => {
    expect(
      resolveCommunityProfileUsername({
        routeUsername: 'personal-user',
        workspaceUsername: 'ws-team',
      }),
    ).toBe('ws-team');
  });

  it('uses the route username outside workspace scope', () => {
    expect(
      resolveCommunityProfileUsername({
        routeUsername: 'personal-user',
      }),
    ).toBe('personal-user');
  });
});

describe('resolveWorkspaceCommunityProfileRedirect', () => {
  it('redirects workspace user URLs to organization URLs', () => {
    expect(
      resolveWorkspaceCommunityProfileRedirect({
        isWorkspaceScope: true,
        pathname: '/hug/community/user/rdmclin2',
        workspaceUsername: 'ws-hug',
      }),
    ).toBe('/community/org/ws-hug');
  });

  it('redirects a mismatched workspace org URL to the active organization URL', () => {
    expect(
      resolveWorkspaceCommunityProfileRedirect({
        isWorkspaceScope: true,
        pathname: '/hug/community/org/other',
        search: '?tab=skills',
        workspaceUsername: 'ws-hug',
      }),
    ).toBe('/community/org/ws-hug?tab=skills');
  });

  it('keeps the current URL outside workspace scope', () => {
    expect(
      resolveWorkspaceCommunityProfileRedirect({
        isWorkspaceScope: false,
        pathname: '/community/user/rdmclin2',
        workspaceUsername: 'ws-hug',
      }),
    ).toBeNull();
  });
});
