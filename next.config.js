const { withSentryConfig } = require('@sentry/nextjs/config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Source-map upload. Without SENTRY_AUTH_TOKEN (local builds) the upload is
  // skipped with a warning and the build still succeeds.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Also map Next internals and node_modules chunks, so stack frames in
  // three/drei/framer-motion resolve too.
  widenClientFileUpload: true,
  // Client maps are uploaded, then deleted from the build, so they are never
  // served publicly (this is the SDK default; stated here so it's deliberate).
  sourcemaps: { deleteSourcemapsAfterUpload: true },

  // Browser events go to our own origin and Next rewrites them on to Sentry,
  // so ad-blockers don't drop them. Fixed path (not `true`, which randomises
  // it per build) because `src/middleware.ts` must exclude it from the locale
  // redirect: middleware runs before rewrites.
  tunnelRoute: '/relay',

  webpack: {
    treeshake: { removeDebugLogging: true },
  },
});
