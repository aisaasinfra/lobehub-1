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

export const shouldShowWorkspaceProfileEdit = ({
  canEdit,
  marketOrganizationProfile,
  user,
}: ShouldShowWorkspaceProfileEditParams) => {
  return (
    canEdit && user.type === 'organization' && marketOrganizationProfile?.accountId === user.id
  );
};
