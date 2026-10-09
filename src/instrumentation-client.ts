// Browser SDK. On Next 14 (webpack) `withSentryConfig` injects this file into
// every client entry; on Next 15.3+ Next loads it natively. Same file either way.
import * as Sentry from '@sentry/nextjs';
import { sentryBaseOptions } from '@/lib/sentryOptions';

Sentry.init({
  ...sentryBaseOptions,

  // Browser noise that says nothing about our code.
  ignoreErrors: [
    // Benign, fired by layout observers when a frame overruns; not actionable.
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Visitor went offline or an extension/ad-blocker killed a request.
    'Failed to fetch',
    'NetworkError when attempting to fetch resource',
    'Load failed',
    'AbortError',
  ],
  denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-(web-)?extension:\/\//],
});

// Lets the SDK time App Router navigations (Next 15.3+ calls it; harmless on 14).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
