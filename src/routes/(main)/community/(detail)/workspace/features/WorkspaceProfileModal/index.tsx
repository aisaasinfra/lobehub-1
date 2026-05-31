'use client';

import { createModal, type ModalInstance } from '@lobehub/ui/base-ui';
import { t } from 'i18next';

import type { DiscoverUserInfo } from '@/types/discover';

import { Content } from './Content';

interface OpenWorkspaceProfileModalOptions {
  onSuccess?: () => void | Promise<void>;
  user: DiscoverUserInfo;
}

export const openWorkspaceProfileModal = ({
  user,
  onSuccess,
}: OpenWorkspaceProfileModalOptions): ModalInstance =>
  createModal({
    content: <Content user={user} onSuccess={onSuccess} />,
    footer: null,
    maskClosable: true,
    styles: {
      content: { padding: 0 },
    },
    title: t(user.namespace ? 'user.workspaceProfile.title' : 'user.workspaceProfile.setup.title', {
      ns: 'discover',
    }),
    width: 'min(92vw, 560px)',
  });
