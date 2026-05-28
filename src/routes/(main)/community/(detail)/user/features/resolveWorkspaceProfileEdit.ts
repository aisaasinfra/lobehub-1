interface CommunityProfileOwner {
  id: number;
  type?: string | null;
}

interface MarketOrganizationProfileRef {
  accountId: number;
}

interface ShouldShowWorkspaceProfileEditParams {
  canEdit: boolean;
  marketOrganizationProfile?: MarketOrganizationProfileRef | null;
  user: CommunityProfileOwner;
}

interface ResolveCommunityProfileUsernameParams {
  routeUsername: string;
  workspaceUsername?: string | null;
}

interface ResolveWorkspaceCommunityProfileRedirectParams {
  isWorkspaceScope: boolean;
  pathname: string;
  search?: string;
  workspaceUsername?: string | null;
}

export const shouldShowWorkspaceProfileEdit = ({
  canEdit,
  marketOrganizationProfile,
  user,
}: ShouldShowWorkspaceProfileEditParams) => {
  return (
    canEdit && user.type === 'organization' && marketOrganizationProfile?.accountId === user.id
  );
};

export const resolveCommunityProfileUsername = ({
  routeUsername,
  workspaceUsername,
}: ResolveCommunityProfileUsernameParams) => workspaceUsername || routeUsername;

export const resolveWorkspaceCommunityProfileRedirect = ({
  isWorkspaceScope,
  pathname,
  search = '',
  workspaceUsername,
}: ResolveWorkspaceCommunityProfileRedirectParams) => {
  if (!isWorkspaceScope || !workspaceUsername) return null;

  const targetPath = `/community/org/${workspaceUsername}`;
  if (pathname.endsWith(targetPath)) return null;
  if (!pathname.includes('/community/user/') && !pathname.includes('/community/org/')) return null;

  return `${targetPath}${search}`;
};
