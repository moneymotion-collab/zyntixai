import type { NextConfig } from "next"
import {
  assertProductionEnvForDeploy,
  shouldEnforceProductionEnv,
} from "./lib/billing/production-env"

if (shouldEnforceProductionEnv()) {
  assertProductionEnvForDeploy()
}

const nextConfig: NextConfig = {  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/project/**",
          "**/remotion/**",
          "**/supabase/functions/**",
          "**/.next/**",
        ],
      }
    }
    return config
  },
}

export default nextConfig
