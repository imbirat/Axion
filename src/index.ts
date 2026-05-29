import 'dotenv/config';
import { ShardingManager } from 'discord.js';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';

async function main(): Promise<void> {
  if (isDev) {
    const { AxionClient } = await import('./structures/AxionClient');
    const client = new AxionClient();
    await client.init();
  } else {
    const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
      token: process.env.DISCORD_TOKEN,
      totalShards: 'auto',
      shardList: 'auto',
      respawn: true,
    });

    manager.on('shardCreate', (shard) => {
      console.log(`[Sharding] Launched shard ${shard.id}`);
    });

    await manager.spawn({ timeout: -1 });
  }
}

main().catch(console.error);
