'use client';

import { Button, Flexbox, Input, Text, TextArea } from '@lobehub/ui';
import { useModalContext } from '@lobehub/ui/base-ui';
import { App, Form } from 'antd';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { workspaceService } from '@/services/workspace';
import type { DiscoverUserInfo } from '@/types/discover';

interface FormValues {
  avatarUrl?: string;
  description?: string;
  displayName: string;
  websiteUrl?: string;
}

interface ContentProps {
  onSuccess?: () => void | Promise<void>;
  user: DiscoverUserInfo;
}

const trimOptional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const Content = memo<ContentProps>(({ user, onSuccess }) => {
  const { t } = useTranslation('discover');
  const { message } = App.useApp();
  const { close } = useModalContext();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleSave = useCallback(async () => {
    if (loading) return;

    const values = await form.validateFields();
    setLoading(true);
    try {
      await workspaceService.updateMarketOrganizationProfile({
        avatarUrl: trimOptional(values.avatarUrl),
        description: trimOptional(values.description),
        displayName: values.displayName.trim(),
        websiteUrl: trimOptional(values.websiteUrl),
      });

      message.success(t('user.workspaceProfile.success'));
      await onSuccess?.();
      close();
    } catch (error) {
      console.error('[WorkspaceProfileModal] Failed to update workspace profile:', error);
      message.error(t('user.workspaceProfile.failed'));
    } finally {
      setLoading(false);
    }
  }, [close, form, loading, message, onSuccess, t]);

  return (
    <Flexbox gap={20} padding={24}>
      <Text type="secondary">{t('user.workspaceProfile.description')}</Text>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          avatarUrl: user.avatarUrl ?? undefined,
          description: user.description ?? undefined,
          displayName: user.displayName ?? user.userName ?? user.namespace,
          websiteUrl: user.socialLinks?.website,
        }}
      >
        <Form.Item
          label={t('user.workspaceProfile.fields.displayName')}
          name="displayName"
          rules={[{ required: true, message: t('user.workspaceProfile.errors.displayName') }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t('user.workspaceProfile.fields.avatarUrl')}
          name="avatarUrl"
          rules={[{ type: 'url', message: t('user.workspaceProfile.errors.url') }]}
        >
          <Input placeholder="https://example.com/avatar.png" />
        </Form.Item>

        <Form.Item
          label={t('user.workspaceProfile.fields.websiteUrl')}
          name="websiteUrl"
          rules={[{ type: 'url', message: t('user.workspaceProfile.errors.url') }]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item label={t('user.workspaceProfile.fields.description')} name="description">
          <TextArea autoSize={{ maxRows: 5, minRows: 3 }} />
        </Form.Item>
      </Form>

      <Flexbox horizontal gap={8} justify="flex-end">
        <Button disabled={loading} onClick={close}>
          {t('user.workspaceProfile.cancel')}
        </Button>
        <Button loading={loading} type="primary" onClick={handleSave}>
          {t('user.workspaceProfile.save')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

Content.displayName = 'WorkspaceProfileModalContent';
