/**
 * Options shared by every `Sentry.init` (browser, Node, edge), so the three
 * runtimes can't drift apart on DSN, environment or sampling.
 *
 * The DSN is public by design (it can only *send* events), and a
 * `NEXT_PUBLIC_` var is inlined at build time for the server bundles too, so
 * one variable covers all three runtimes. With no DSN, or outside a production
 * build, the SDK is disabled entirely: local dev never pollutes the project.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryBaseOptions = {
  dsn,
  enabled: !!dsn && process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'production',
  // 10% of page loads / navigations / SSR requests is plenty of signal for this
  // traffic and keeps us well inside the free tier's span quota. Errors are
  // never sampled: every one is sent.
  tracesSampleRate: 0.1,
  // Don't attach IPs, cookies or request bodies; nothing here needs them.
  sendDefaultPii: false,
};
