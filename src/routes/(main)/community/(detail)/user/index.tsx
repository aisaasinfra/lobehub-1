'use client';

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useCommunityWorkspaceProfile } from '@/business/client/hooks/useCommunityWorkspaceProfile';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';
import { type MarketUserProfile } from '@/layout/AuthProvider/MarketAuth/types';
import { useDiscoverStore } from '@/store/discover';
import type { DiscoverUserProfile } from '@/types/discover';

import NotFound from '../components/NotFound';
import { UserDetailProvider } from './features/DetailProvider';
import UserHeader from './features/Header';
import {
  resolveCommunityProfileUsername,
  resolveWorkspaceCommunityProfileRedirect,
  shouldShowWorkspaceProfileEdit,
} from './features/resolveWorkspaceProfileEdit';
import UserContent from './features/UserContent';
import { useUserDetail } from './features/useUserDetail';
import { openWorkspaceProfileModal } from './features/WorkspaceProfileModal';
import Loading from './loading';

interface UserDetailPageProps {
  mobile?: boolean;
}

const UserDetailPage = memo<UserDetailPageProps>(({ mobile }) => {
  const params = useParams<{ slug: string }>();
  const location = useLocation();
  const routeUsername = decodeURIComponent(params.slug ?? '');
  const navigate = useWorkspaceAwareNavigate();
  const {
    avatarUrl: workspaceAvatarUrl,
    canEdit: canEditWorkspaceProfile,
    description: workspaceDescription,
    displayName: workspaceDisplayName,
    isWorkspaceScope,
    profile: marketOrganizationProfile,
    refresh: refreshWorkspaceProfile,
    username: workspaceUsername,
  } = useCommunityWorkspaceProfile();

  const { checkAndShowClaimableResources, getCurrentUserInfo, isAuthenticated, openProfileSetup } =
    useMarketAuth();

  const useUserProfile = useDiscoverStore((s) => s.useUserProfile);
  const username = resolveCommunityProfileUsername({
    routeUsername,
    workspaceUsername,
  });
  const { data, isLoading, mutate } = useUserProfile({ username });
  const workspaceFallbackProfile = useMemo<DiscoverUserProfile | null>(() => {
    if (!isWorkspaceScope || !workspaceUsername) return null;

    return {
      agentGroups: [],
      agents: [],
      favoriteAgentGroups: [],
      favoriteAgents: [],
      forkedAgentGroups: [],
      forkedAgents: [],
      plugins: [],
      skills: [],
      user: {
        avatarUrl: workspaceAvatarUrl ?? null,
        bannerUrl: null,
        createdAt: '',
        description: workspaceDescription ?? null,
        displayName: workspaceDisplayName ?? workspaceUsername,
        followersCount: 0,
        followingCount: 0,
        id: marketOrganizationProfile?.accountId ?? 0,
        namespace: workspaceUsername,
        socialLinks: null,
        type: 'organization',
        userName: null,
      },
    };
  }, [
    isWorkspaceScope,
    marketOrganizationProfile?.accountId,
    workspaceAvatarUrl,
    workspaceDescription,
    workspaceDisplayName,
    workspaceUsername,
  ]);
  const profileData = data ?? workspaceFallbackProfile;

  useEffect(() => {
    const redirectTo = resolveWorkspaceCommunityProfileRedirect({
      isWorkspaceScope,
      pathname: location.pathname,
      search: location.search,
    });
    if (redirectTo) navigate(redirectTo, { replace: true });
  }, [isWorkspaceScope, location.pathname, location.search, navigate]);

  // Get current user's profile to check ownership by userName
  const currentUser = getCurrentUserInfo();
  const { data: currentUserProfile } = useMarketUserProfile(currentUser?.sub);

  // Check if the current user is viewing their own profile
  const isOwner =
    !isWorkspaceScope &&
    isAuthenticated &&
    !!currentUser &&
    profileData?.user?.namespace === currentUserProfile?.namespace;

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
      const currentUserName = profileData?.user?.userName || profileData?.user?.namespace;
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
    [profileData?.user?.userName, profileData?.user?.namespace, openProfileSetup, navigate, mutate],
  );

  const handleEditWorkspaceProfile = useCallback(() => {
    if (!profileData?.user) return;

    openWorkspaceProfileModal({
      onSuccess: async () => {
        await Promise.all([mutate(), refreshWorkspaceProfile()]);
      },
      user: profileData.user,
    });
  }, [profileData?.user, mutate, refreshWorkspaceProfile]);

  const contextConfig = useMemo(() => {
    if (!profileData || !profileData.user) return null;
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
    } = profileData;
    const totalInstalls = agents.reduce((sum, agent) => sum + (agent.installCount || 0), 0);
    const shouldRenderWorkspaceEdit = shouldShowWorkspaceProfileEdit({
      canEdit: canEditWorkspaceProfile,
      marketOrganizationProfile,
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
      hideFollowButton: isWorkspaceScope,
      isOwner,
      mobile,
      onEditProfile: isWorkspaceScope ? undefined : handleEditProfile,
      onEditWorkspaceProfile: shouldRenderWorkspaceEdit ? handleEditWorkspaceProfile : undefined,
      onStatusChange: isOwner ? handleStatusChange : undefined,
      plugins: plugins || [],
      skills: skills || [],
      totalInstalls,
      user,
    };
  }, [
    handleEditProfile,
    handleEditWorkspaceProfile,
    handleStatusChange,
    isOwner,
    isWorkspaceScope,
    marketOrganizationProfile,
    mobile,
    profileData,
    canEditWorkspaceProfile,
  ]);

  if (isLoading && !workspaceFallbackProfile) return <Loading />;
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

export const WorkspaceCommunityPage = memo(() => {
  return <UserDetailPage />;
});

export default UserDetailPage;
