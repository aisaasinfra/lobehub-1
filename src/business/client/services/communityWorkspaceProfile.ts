export interface UpdateCommunityWorkspaceProfileInput {
  avatarUrl?: string;
  description?: string;
  displayName?: string;
  websiteUrl?: string;
}

export const updateCommunityWorkspaceProfile = async (
  _input: UpdateCommunityWorkspaceProfileInput,
): Promise<void> => {};
