'use client';

import { memo, useCallback, useMemo } from 'react';

import { useCommunityWorkspaceProfile } from '@/business/client/hooks/useCommunityWorkspaceProfile';
import { useDiscoverStore } from '@/store/discover';
import type { DiscoverUserProfile } from '@/types/discover';

import NotFound from '../components/NotFound';
import { WorkspaceDetailProvider } from './features/DetailProvider';
import WorkspaceHeader from './features/Header';
import { resolveWorkspaceCommunityProfile } from './features/resolveWorkspaceProfileEdit';
import WorkspaceContent from './features/WorkspaceContent';
import { openWorkspaceProfileModal } from './features/WorkspaceProfileModal';
import Loading from './loading';

interface WorkspaceDetailPageProps {
  mobile?: boolean;
}

const WorkspaceDetailPage = memo<WorkspaceDetailPageProps>(({ mobile }) => {
  const {
    avatarUrl: workspaceAvatarUrl,
    bannerUrl: workspaceBannerUrl,
    canEdit,
    description: workspaceDescription,
    displayName: workspaceDisplayName,
    profile: marketOrganizationProfile,
    refresh: refreshWorkspaceProfile,
    username: workspaceUsername,
  } = useCommunityWorkspaceProfile();

  const useUserProfile = useDiscoverStore((s) => s.useUserProfile);
  const { data, isLoading, mutate } = useUserProfile({ username: workspaceUsername ?? '' });

  // Fallback profile so the page header renders even before the market profile is materialized
  const fallbackProfile = useMemo<DiscoverUserProfile | null>(() => {
    if (!workspaceUsername) return null;
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
        bannerUrl: workspaceBannerUrl ?? null,
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
    marketOrganizationProfile?.accountId,
    workspaceAvatarUrl,
    workspaceBannerUrl,
    workspaceDescription,
    workspaceDisplayName,
    workspaceUsername,
  ]);

  const profileData = useMemo(
    () =>
      resolveWorkspaceCommunityProfile({
        fallbackProfile,
        marketProfile: data,
      }),
    [data, fallbackProfile],
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
    if (!profileData?.user) return null;
    const { user, agents, agentGroups, skills, plugins } = profileData;
    const totalInstalls = agents.reduce((sum, agent) => sum + (agent.installCount || 0), 0);
    const canEditCurrent =
      canEdit && user.type === 'organization' && marketOrganizationProfile?.accountId === user.id;

    return {
      agentCount: agents.length,
      agentGroups: agentGroups || [],
      agents,
      canEdit: canEditCurrent,
      groupCount: agentGroups?.length || 0,
      mobile,
      onEditWorkspaceProfile: canEditCurrent ? handleEditWorkspaceProfile : undefined,
      plugins: plugins || [],
      skills: skills || [],
      totalInstalls,
      user,
    };
  }, [canEdit, handleEditWorkspaceProfile, marketOrganizationProfile, mobile, profileData]);

  if (isLoading && !fallbackProfile) return <Loading />;
  if (!contextConfig) return <NotFound />;

  return (
    <WorkspaceDetailProvider config={contextConfig}>
      <WorkspaceHeader />
      <WorkspaceContent />
    </WorkspaceDetailProvider>
  );
});

export const MobileWorkspaceDetailPage = memo(() => {
  return <WorkspaceDetailPage mobile={true} />;
});

export default WorkspaceDetailPage;
