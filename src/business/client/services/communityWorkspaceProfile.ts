export interface UpdateCommunityWorkspaceProfileInput {
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  description?: string;
  displayName?: string;
  websiteUrl?: string;
}

export interface SetupCommunityWorkspaceProfileInput extends UpdateCommunityWorkspaceProfileInput {
  displayName: string;
  namespace: string;
}

export const setupCommunityWorkspaceProfile = async (
  _input: SetupCommunityWorkspaceProfileInput,
): Promise<void> => {};

export const updateCommunityWorkspaceProfile = async (
  _input: UpdateCommunityWorkspaceProfileInput,
): Promise<void> => {};

export const syncCommunityWorkspaceMembers = async (): Promise<void> => {};
