import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || ''

// For edge or browser execution fallback, postgres client should be instantiated conditionally
const client = connectionString ? postgres(connectionString, { prepare: false }) : null

export const db = client ? drizzle(client, { schema }) : null
