const { connectDB } = require('./dist/config/db');
const app = require('./dist/app').default;
const { runTests } = require('./test-flow');

async function main() {
  console.log('[Test Runner] Connecting to database...');
  await connectDB();

  const server = app.listen(5000, async () => {
    console.log('[Test Runner] Test server listening on http://127.0.0.1:5000');
    try {
      await runTests();
      console.log('[Test Runner] Finished all tests successfully.');
      server.close(() => {
        console.log('[Test Runner] Server stopped.');
        process.exit(0);
      });
    } catch (err) {
      console.error('[Test Runner] Test error:', err);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

main().catch((err) => {
  console.error('[Test Runner] Startup error:', err);
  process.exit(1);
});

