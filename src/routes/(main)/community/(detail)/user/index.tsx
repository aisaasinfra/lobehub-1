'use client';

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';
import { type MarketUserProfile } from '@/layout/AuthProvider/MarketAuth/types';
import { useClientDataSWR } from '@/libs/swr';
import { workspaceService } from '@/services/workspace';
import { useDiscoverStore } from '@/store/discover';
import { useWorkspaceStore, workspaceSelectors } from '@/store/workspace';

import NotFound from '../components/NotFound';
import { UserDetailProvider } from './features/DetailProvider';
import UserHeader from './features/Header';
import { shouldShowWorkspaceProfileEdit } from './features/resolveWorkspaceProfileEdit';
import UserContent from './features/UserContent';
import { useUserDetail } from './features/useUserDetail';
import { openWorkspaceProfileModal } from './features/WorkspaceProfileModal';
import Loading from './loading';

interface UserDetailPageProps {
  mobile?: boolean;
}

const UserDetailPage = memo<UserDetailPageProps>(({ mobile }) => {
  const params = useParams<{ slug: string }>();
  const username = decodeURIComponent(params.slug ?? '');
  const navigate = useWorkspaceAwareNavigate();

  const { checkAndShowClaimableResources, getCurrentUserInfo, isAuthenticated, openProfileSetup } =
    useMarketAuth();

  const useUserProfile = useDiscoverStore((s) => s.useUserProfile);
  const { data, isLoading, mutate } = useUserProfile({ username });
  const activeWorkspaceId = useWorkspaceStore(workspaceSelectors.activeWorkspaceId);
  const shouldFetchWorkspaceProfile = !!activeWorkspaceId && data?.user?.type === 'organization';
  const { data: workspaceOrganizationProfile, mutate: mutateWorkspaceOrganizationProfile } =
    useClientDataSWR(
      shouldFetchWorkspaceProfile
        ? ['community-workspace-organization-profile', activeWorkspaceId]
        : null,
      () => workspaceService.getMarketOrganizationProfile(),
    );

  // Get current user's profile to check ownership by userName
  const currentUser = getCurrentUserInfo();
  const { data: currentUserProfile } = useMarketUserProfile(currentUser?.sub);

  // Check if the current user is viewing their own profile
  const isOwner =
    isAuthenticated && !!currentUser && data?.user?.namespace === currentUserProfile?.namespace;

  // Track if we've already checked for claimable resources in this session
  const hasCheckedClaimable = useRef(false);

  // Check for claimable resources when owner visits their profile
  useEffect(() => {
    if (isOwner && !hasCheckedClaimable.current) {
      hasCheckedClaimable.current = true;
      // Pass mutate callback to refresh page data after claim
      checkAndShowClaimableResources(() => {
        mutate();
      });
    }
  }, [isOwner, checkAndShowClaimableResources, mutate]);

  const { handleStatusChange } = useUserDetail({ onMutate: mutate });

  // Handle profile edit with navigation on userName change
  const handleEditProfile = useCallback(
    (onSuccess?: (profile: MarketUserProfile) => void) => {
      const currentUserName = data?.user?.userName || data?.user?.namespace;
      openProfileSetup((profile) => {
        // Call the original onSuccess callback if provided
        onSuccess?.(profile);

        // Refresh page data to show updated profile
        mutate();

        // Navigate to new URL if userName changed
        const newUserName = profile.userName || profile.namespace;
        if (newUserName && newUserName !== currentUserName) {
          navigate(`/community/user/${newUserName}`, { replace: true });
        }
      });
    },
    [data?.user?.userName, data?.user?.namespace, openProfileSetup, navigate, mutate],
  );

  const handleEditWorkspaceProfile = useCallback(() => {
    if (!data?.user) return;

    openWorkspaceProfileModal({
      onSuccess: async () => {
        await Promise.all([mutate(), mutateWorkspaceOrganizationProfile()]);
      },
      user: data.user,
    });
  }, [data?.user, mutate, mutateWorkspaceOrganizationProfile]);

  const contextConfig = useMemo(() => {
    if (!data || !data.user) return null;
    const {
      user,
      agents,
      agentGroups,
      forkedAgents,
      forkedAgentGroups,
      favoriteAgents,
      favoriteAgentGroups,
      skills,
      plugins,
    } = data;
    const totalInstalls = agents.reduce((sum, agent) => sum + (agent.installCount || 0), 0);
    const canEditWorkspaceProfile = shouldShowWorkspaceProfileEdit({
      canEdit: workspaceOrganizationProfile?.canEdit ?? false,
      marketOrganizationProfile: workspaceOrganizationProfile?.profile ?? null,
      user,
    });

    return {
      agentCount: agents.length,
      agentGroups: agentGroups || [],
      agents,
      favoriteAgentGroups: favoriteAgentGroups || [],
      favoriteAgents: favoriteAgents || [],
      forkedAgentGroups: forkedAgentGroups || [],
      forkedAgents: forkedAgents || [],
      groupCount: agentGroups?.length || 0,
      isOwner,
      mobile,
      onEditProfile: handleEditProfile,
      onEditWorkspaceProfile: canEditWorkspaceProfile ? handleEditWorkspaceProfile : undefined,
      onStatusChange: isOwner ? handleStatusChange : undefined,
      plugins: plugins || [],
      skills: skills || [],
      totalInstalls,
      user,
    };
  }, [
    data,
    handleEditProfile,
    handleEditWorkspaceProfile,
    handleStatusChange,
    isOwner,
    mobile,
    workspaceOrganizationProfile?.canEdit,
    workspaceOrganizationProfile?.profile,
  ]);

  if (isLoading) return <Loading />;
  if (!contextConfig) return <NotFound />;

  return (
    <UserDetailProvider config={contextConfig}>
      <UserHeader />
      <UserContent />
    </UserDetailProvider>
  );
});

export const MobileUserDetailPage = memo(() => {
  return <UserDetailPage mobile={true} />;
});

export default UserDetailPage;
