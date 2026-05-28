'use client';

import { Flexbox, Grid, Tag, Text } from '@lobehub/ui';
import { Input, Pagination } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssistantEmpty from '../../../features/AssistantEmpty';
import UserAgentCard from '../../user/features/UserAgentCard';
import { useWorkspaceDetailContext } from './DetailProvider';

interface WorkspaceAgentListProps {
  pageSize?: number;
  rows?: number;
}

const WorkspaceAgentList = memo<WorkspaceAgentListProps>(({ rows = 4, pageSize = 8 }) => {
  const { t } = useTranslation('discover');
  const { agents, agentCount, canEdit } = useWorkspaceDetailContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    let list = [...agents];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((agent) => {
        const name = agent?.title?.toLowerCase() || '';
        const description = agent?.description?.toLowerCase() || '';
        return name.includes(query) || description.includes(query);
      });
    }
    return list;
  }, [agents, searchQuery]);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAgents.slice(startIndex, startIndex + pageSize);
  }, [filteredAgents, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (agents.length === 0) {
    return (
      <AssistantEmpty description={t('user.workspace.noAgents')} title={t('user.noAgents.title')} />
    );
  }

  const showPagination = filteredAgents.length > pageSize;

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Text fontSize={16} weight={500}>
            {t('user.publishedAgents')}
          </Text>
          {agentCount > 0 && <Tag>{filteredAgents.length}</Tag>}
        </Flexbox>
        {canEdit && (
          <Input.Search
            allowClear
            placeholder={t('user.searchPlaceholder')}
            style={{ width: 200 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </Flexbox>
      <Grid rows={rows} width={'100%'}>
        {paginatedAgents.map((item, index) => (
          <UserAgentCard key={item.identifier || index} {...item} />
        ))}
      </Grid>
      {showPagination && (
        <Flexbox align={'center'} justify={'center'}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            showSizeChanger={false}
            total={filteredAgents.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default WorkspaceAgentList;
