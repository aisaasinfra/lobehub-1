import { describe, expect, it } from 'vitest';

import { shouldShowWorkspaceProfileEdit } from './resolveWorkspaceProfileEdit';

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
