import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 8787;

async function main() {
  const app = await createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
