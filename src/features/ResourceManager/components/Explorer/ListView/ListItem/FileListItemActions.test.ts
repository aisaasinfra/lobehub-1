import type { ItemType } from 'antd/es/menu/interface';
import { describe, expect, it } from 'vitest';

import { appendTransferMenuItemsBeforeDelete } from './FileListItemActions';

describe('appendTransferMenuItemsBeforeDelete', () => {
  it('keeps delete as the final menu action', () => {
    const baseItems = [
      { key: 'copyUrl' },
      { key: 'download' },
      { type: 'divider' },
      { key: 'delete' },
    ] as ItemType[];
    const transferItems = [{ key: 'transfer' }, { key: 'copy' }] as ItemType[];

    const result = appendTransferMenuItemsBeforeDelete(baseItems, transferItems);

    expect(result.map((item) => item && ('key' in item ? item.key : item.type))).toEqual([
      'copyUrl',
      'download',
      'transfer',
      'copy',
      'divider',
      'delete',
    ]);
  });
});
