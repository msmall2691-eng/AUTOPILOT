export async function register() {
  // Run schema sync on server startup (runtime only, DATABASE_URL available)
  if (process.env.DATABASE_URL) {
    const { ensureSchema } = await import('@/lib/db')
    await ensureSchema()
  }
}
