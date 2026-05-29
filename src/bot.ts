import { AxionClient } from './structures/AxionClient';

const client = new AxionClient();
client.init().catch((error) => {
  client.logger.error('Failed to start bot:', error);
  process.exit(1);
});

export default client;
