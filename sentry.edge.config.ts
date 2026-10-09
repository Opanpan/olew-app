// Edge runtime SDK: `src/middleware.ts` (the locale redirect) runs here.
import * as Sentry from '@sentry/nextjs';
import { sentryBaseOptions } from '@/lib/sentryOptions';

Sentry.init(sentryBaseOptions);
