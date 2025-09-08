// Global test teardown

export default async function globalTeardown() {
  console.log('Tearing down MongoDB test servers...');
  
  const servers = (global as any).__MONGO_SERVERS__;
  
  if (servers && Array.isArray(servers)) {
    for (const server of servers) {
      await server.stop();
    }
  }
  
  console.log('MongoDB test servers stopped');
}
