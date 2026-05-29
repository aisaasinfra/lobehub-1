'use client';

import { Button, Center, Flexbox, Input, Text, TextArea } from '@lobehub/ui';
import { useModalContext } from '@lobehub/ui/base-ui';
import type { UploadProps } from 'antd';
import { App, Form, Upload } from 'antd';
import { cssVar } from 'antd-style';
import { ImagePlus, Trash2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { updateCommunityWorkspaceProfile } from '@/business/client/services/communityWorkspaceProfile';
import EmojiPicker from '@/components/EmojiPicker';
import { useFileStore } from '@/store/file';
import type { DiscoverUserInfo } from '@/types/discover';

interface FormValues {
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
  return trimmed || undefined;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const Content = memo<ContentProps>(({ user, onSuccess }) => {
  const { t } = useTranslation('discover');
  const { message } = App.useApp();
  const { close } = useModalContext();
  const [form] = Form.useForm<FormValues>();
  const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(user.bannerUrl ?? null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        message.error(t('user.workspaceProfile.errors.fileTooLarge'));
        return;
      }

      setAvatarUploading(true);
      try {
        const result = await uploadWithProgress({ file });
        if (!result?.url) {
          message.error(t('user.workspaceProfile.errors.uploadFailed'));
          return;
        }
        setAvatarUrl(
          result.url.startsWith('/') ? `${window.location.origin}${result.url}` : result.url,
        );
      } catch (error) {
        console.error('[WorkspaceProfileModal] Avatar upload failed:', error);
        message.error(t('user.workspaceProfile.errors.uploadFailed'));
      } finally {
        setAvatarUploading(false);
      }
    },
    [message, t, uploadWithProgress],
  );

  const handleAvatarChange = useCallback((next: string) => {
    if (next.startsWith('data:')) return;
    try {
      const { protocol } = new URL(next);
      if (protocol === 'http:' || protocol === 'https:') {
        setAvatarUrl(next);
      }
    } catch {
      // Workspace Market profiles only accept URL avatars.
    }
  }, []);

  const handleBannerUpload: UploadProps['customRequest'] = useCallback(
    async (options: Parameters<NonNullable<UploadProps['customRequest']>>[0]) => {
      const file = options.file as File;

      if (file.size > MAX_FILE_SIZE) {
        message.error(t('user.workspaceProfile.errors.fileTooLarge'));
        options.onError?.(new Error('File too large'));
        return;
      }

      setBannerUploading(true);
      try {
        const result = await uploadWithProgress({ file });
        if (!result?.url) {
          message.error(t('user.workspaceProfile.errors.uploadFailed'));
          options.onError?.(new Error('Upload failed'));
          return;
        }
        const url = result.url.startsWith('/')
          ? `${window.location.origin}${result.url}`
          : result.url;
        setBannerUrl(url);
        options.onSuccess?.(result);
      } catch (error) {
        console.error('[WorkspaceProfileModal] Banner upload failed:', error);
        message.error(t('user.workspaceProfile.errors.uploadFailed'));
        options.onError?.(error as Error);
      } finally {
        setBannerUploading(false);
      }
    },
    [message, t, uploadWithProgress],
  );

  const handleSave = useCallback(async () => {
    if (loading) return;

    const values = await form.validateFields();
    setLoading(true);
    try {
      await updateCommunityWorkspaceProfile({
        avatarUrl,
        bannerUrl,
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
  }, [avatarUrl, bannerUrl, close, form, loading, message, onSuccess, t]);

  return (
    <Flexbox gap={20} padding={24}>
      <Text type="secondary">{t('user.workspaceProfile.description')}</Text>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          description: user.description ?? undefined,
          displayName: user.displayName ?? user.userName ?? user.namespace,
          websiteUrl: user.socialLinks?.website,
        }}
      >
        <Flexbox horizontal gap={24}>
          <Flexbox flex={1}>
            <Form.Item
              label={t('user.workspaceProfile.fields.displayName')}
              name="displayName"
              rules={[{ required: true, message: t('user.workspaceProfile.errors.displayName') }]}
            >
              <Input />
            </Form.Item>
          </Flexbox>

          <Form.Item label={t('user.workspaceProfile.fields.avatar')}>
            <EmojiPicker
              allowDelete={!!avatarUrl}
              loading={avatarUploading}
              shape="square"
              size={80}
              value={avatarUrl || undefined}
              allowUpload={{
                enableEmoji: false,
              }}
              onChange={handleAvatarChange}
              onDelete={() => setAvatarUrl(null)}
              onUpload={handleAvatarUpload}
            />
          </Form.Item>
        </Flexbox>

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

        <Form.Item label={t('user.workspaceProfile.fields.bannerUrl')}>
          <Flexbox gap={8} width="100%">
            <Upload
              accept="image/*"
              customRequest={handleBannerUpload}
              maxCount={1}
              showUploadList={false}
              style={{ display: 'block', width: '100%' }}
            >
              <div
                style={{
                  backgroundColor: bannerUrl ? undefined : cssVar.colorFillTertiary,
                  backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  borderRadius: cssVar.borderRadiusLG,
                  cursor: 'pointer',
                  height: 160,
                  overflow: 'hidden',
                  position: 'relative',
                  width: '100%',
                }}
              >
                <Center
                  style={{
                    background: bannerUrl ? 'rgba(0,0,0,0.4)' : 'transparent',
                    height: '100%',
                    opacity: bannerUrl ? 0 : 1,
                    transition: 'opacity 0.2s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (bannerUrl) e.currentTarget.style.opacity = '0';
                  }}
                >
                  <Flexbox align="center" gap={8}>
                    <ImagePlus
                      size={24}
                      style={{ color: bannerUrl ? '#fff' : cssVar.colorTextSecondary }}
                    />
                    <Text
                      style={{
                        color: bannerUrl ? '#fff' : cssVar.colorTextSecondary,
                        fontSize: 12,
                      }}
                    >
                      {bannerUploading
                        ? t('user.workspaceProfile.fields.bannerUrl.uploading')
                        : t('user.workspaceProfile.fields.bannerUrl.clickToUpload')}
                    </Text>
                  </Flexbox>
                </Center>
              </div>
            </Upload>
            {bannerUrl && (
              <Flexbox horizontal align="center" gap={8} justify="flex-end">
                <Text
                  style={{
                    color: cssVar.colorError,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerUrl(null);
                  }}
                >
                  <Flexbox horizontal align="center" gap={4}>
                    <Trash2 size={12} />
                    {t('user.workspaceProfile.fields.bannerUrl.remove')}
                  </Flexbox>
                </Text>
              </Flexbox>
            )}
          </Flexbox>
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
