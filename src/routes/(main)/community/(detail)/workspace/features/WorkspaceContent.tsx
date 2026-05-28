'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import WorkspaceAgentList from './WorkspaceAgentList';
import WorkspaceGroupList from './WorkspaceGroupList';
import WorkspacePluginList from './WorkspacePluginList';
import WorkspaceSkillList from './WorkspaceSkillList';

const WorkspaceContent = memo(() => {
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
