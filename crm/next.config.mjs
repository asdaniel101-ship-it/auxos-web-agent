import pkg from '@next/env'
const { loadEnvConfig } = pkg
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// Load env from monorepo root (caches in @next/env, so app-local .env files won't load)
const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnvConfig(resolve(__dirname, '..'))

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
