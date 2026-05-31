'use client';

import { Button, Center, Flexbox, Icon, Text } from '@lobehub/ui';
import { Building2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ListLoading from '@/routes/(main)/community/components/ListLoading';

import { useWorkspaceDetailContext } from './DetailProvider';
import WorkspaceAgentList from './WorkspaceAgentList';
import WorkspaceGroupList from './WorkspaceGroupList';
import WorkspacePluginList from './WorkspacePluginList';
import WorkspaceSkillList from './WorkspaceSkillList';

const WorkspaceContent = memo(() => {
  const { t } = useTranslation('discover');
  const { canEdit, isLoading, onEditWorkspaceProfile, user } = useWorkspaceDetailContext();

  // While the market profile is still resolving we don't yet know whether this
  // workspace has a community profile, so render a skeleton instead of flashing
  // the setup empty-state (which would pop in and then be replaced by content).
  if (!user.namespace && isLoading) return <ListLoading length={4} rows={4} />;

  if (!user.namespace) {
    return (
      <Center height="100%" style={{ minHeight: '42vh' }} width="100%">
        <Flexbox align="center" gap={16} style={{ maxWidth: 420, textAlign: 'center' }}>
          <Icon icon={Building2} size={40} />
          <Flexbox gap={8}>
            <Text as="h2" fontSize={24} style={{ margin: 0 }} weight="bold">
              {t('user.workspaceProfile.setup.empty.title')}
            </Text>
            <Text type="secondary">{t('user.workspaceProfile.setup.empty.description')}</Text>
          </Flexbox>
          {canEdit && onEditWorkspaceProfile && (
            <Button type="primary" onClick={onEditWorkspaceProfile}>
              {t('user.workspaceProfile.setup.save')}
            </Button>
          )}
        </Flexbox>
      </Center>
    );
  }

  return (
    <Flexbox gap={32}>
      <WorkspaceAgentList />
      <WorkspaceGroupList />
      <WorkspaceSkillList />
      <WorkspacePluginList />
    </Flexbox>
  );
});

export default WorkspaceContent;
