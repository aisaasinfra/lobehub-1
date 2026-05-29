'use client';

import { Flexbox, Grid, Tag, Text } from '@lobehub/ui';
import { Input, Pagination } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserGroupCard from '../../user/features/UserGroupCard';
import { useWorkspaceDetailContext } from './DetailProvider';
import {
  filterWorkspaceMarketItems,
  type WorkspaceMarketStatusFilterValue,
} from './filterWorkspaceMarketItems';
import WorkspaceStatusFilter from './WorkspaceStatusFilter';

interface WorkspaceGroupListProps {
  pageSize?: number;
  rows?: number;
}

const WorkspaceGroupList = memo<WorkspaceGroupListProps>(({ rows = 4, pageSize = 8 }) => {
  const { t } = useTranslation('discover');
  const { agentGroups = [], groupCount, canEdit } = useWorkspaceDetailContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkspaceMarketStatusFilterValue>('published');

  const filteredGroups = useMemo(() => {
    return filterWorkspaceMarketItems({
      getDescription: (group) => group.description,
      getTitle: (group) => group.title,
      items: agentGroups,
      searchQuery,
      status: statusFilter,
    });
  }, [agentGroups, searchQuery, statusFilter]);

  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredGroups.slice(startIndex, startIndex + pageSize);
  }, [filteredGroups, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (agentGroups.length === 0) return null;

  const showPagination = filteredGroups.length > pageSize;

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Text fontSize={16} weight={500}>
            {t('user.publishedGroups', { defaultValue: '创作的群组' })}
          </Text>
          {groupCount > 0 && <Tag>{filteredGroups.length}</Tag>}
        </Flexbox>
        {canEdit && (
          <Flexbox horizontal align={'center'} gap={8}>
            <Input.Search
              allowClear
              placeholder={t('user.searchPlaceholder')}
              style={{ width: 200 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <WorkspaceStatusFilter value={statusFilter} onChange={setStatusFilter} />
          </Flexbox>
        )}
      </Flexbox>
      <Grid rows={rows} width={'100%'}>
        {paginatedGroups.map((item, index) => (
          <UserGroupCard key={item.identifier || index} {...item} />
        ))}
      </Grid>
      {showPagination && (
        <Flexbox align={'center'} justify={'center'}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            showSizeChanger={false}
            total={filteredGroups.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default WorkspaceGroupList;
