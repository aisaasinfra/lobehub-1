import { register } from '@lobechat/observability-otel/node';

import packageJson from '../package.json';

register({ version: packageJson.version });
