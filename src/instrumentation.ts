import * as Sentry from '@sentry/nextjs';

// Next calls this once per server runtime at boot. On Next 14 it needs
// `experimental.instrumentationHook`, which `withSentryConfig` switches on.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Next 15+ reports server render/route errors through this hook. Next 14
// ignores it; there the SDK's build-time wrappers capture those errors.
export const onRequestError = Sentry.captureRequestError;
