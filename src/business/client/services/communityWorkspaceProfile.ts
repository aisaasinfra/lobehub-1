export interface UpdateCommunityWorkspaceProfileInput {
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  description?: string;
  displayName?: string;
  websiteUrl?: string;
}

export const updateCommunityWorkspaceProfile = async (
  _input: UpdateCommunityWorkspaceProfileInput,
): Promise<void> => {};
