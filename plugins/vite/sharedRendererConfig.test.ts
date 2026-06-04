import { afterEach, describe, expect, it } from 'vitest';

import { __testing, sharedModulePreload, sharedRendererDefine } from './sharedRendererConfig';

const originalReactScan = process.env.REACT_SCAN;

afterEach(() => {
  if (originalReactScan === undefined) {
    delete process.env.REACT_SCAN;
  } else {
    process.env.REACT_SCAN = originalReactScan;
  }
});

describe('sharedModulePreload', () => {
  it('keeps vendor modulepreload dependencies while excluding i18n chunks', () => {
    const resolveDependencies = sharedModulePreload.resolveDependencies!;

    expect(
      resolveDependencies(
        'assets/index.js',
        [
          'assets/vendor-icons.js',
          'vendor/vendor-react.js',
          'i18n/i18n-default.js',
          'assets/i18n-en-US.js',
          'assets/page.js',
        ],
        { hostId: 'index.html', hostType: 'html' },
      ),
    ).toEqual(['assets/vendor-icons.js', 'vendor/vendor-react.js', 'assets/page.js']);
  });
});

describe('sharedManualChunks', () => {
  it('groups stable runtime packages into coarse vendor chunks', () => {
    expect(
      __testing.sharedManualChunks('/repo/node_modules/.pnpm/react@19/node_modules/react/index.js'),
    ).toBe('vendor-react');
    expect(
      __testing.sharedManualChunks(
        '/repo/node_modules/.pnpm/react-dom@19/node_modules/react-dom/client.js',
      ),
    ).toBe('vendor-react');
    expect(
      __testing.sharedManualChunks(
        '/repo/node_modules/.pnpm/@emotion+react/node_modules/@emotion/react/dist/index.js',
      ),
    ).toBe('vendor-ui-runtime');
    expect(
      __testing.sharedManualChunks(
        '/repo/node_modules/.pnpm/motion@12/node_modules/motion/react/dist/index.js',
      ),
    ).toBe('vendor-ui-runtime');
    expect(
      __testing.sharedManualChunks(
        '/repo/node_modules/.pnpm/lucide-react/node_modules/lucide-react/dist/index.js',
      ),
    ).toBe('vendor-icons');
    expect(
      __testing.sharedManualChunks(
        '/repo/node_modules/.pnpm/zustand@5/node_modules/zustand/esm/index.mjs',
      ),
    ).toBe('vendor-data-runtime');
    expect(
      __testing.sharedManualChunks('/repo/packages/model-runtime/src/providers/openai/index.ts'),
    ).toBe('vendor-ai-runtime');
    expect(
      __testing.sharedManualChunks(
        '/repo/node_modules/.pnpm/openai@4/node_modules/openai/index.mjs',
      ),
    ).toBe('vendor-ai-runtime');
  });
});

describe('sharedRendererDefine', () => {
  it('keeps react-scan disabled by default', () => {
    delete process.env.REACT_SCAN;

    expect(sharedRendererDefine({ isElectron: false, isMobile: false }).__REACT_SCAN__).toBe(
      'false',
    );
  });

  it('enables react-scan only when explicitly requested', () => {
    process.env.REACT_SCAN = 'true';

    expect(sharedRendererDefine({ isElectron: false, isMobile: false }).__REACT_SCAN__).toBe(
      'true',
    );

    process.env.REACT_SCAN = '1';

    expect(sharedRendererDefine({ isElectron: false, isMobile: false }).__REACT_SCAN__).toBe(
      'true',
    );
  });
});
