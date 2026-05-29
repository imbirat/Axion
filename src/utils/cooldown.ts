import { AxionClient } from '../structures/AxionClient';
import { CooldownKey } from '../types';

export class CooldownManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async check(key: CooldownKey, duration: number): Promise<number | null> {
    const cacheKey = `cooldown:${key.userId}:${key.commandName}`;

    const cached = await this.client.cache.get(cacheKey);
    if (cached) {
      const remaining = parseInt(cached, 10) - Date.now();
      if (remaining > 0) return remaining;
    }

    const expiry = Date.now() + duration;
    await this.client.cache.set(cacheKey, expiry.toString(), Math.ceil(duration / 1000));
    return null;
  }

  public async clear(key: CooldownKey): Promise<void> {
    const cacheKey = `cooldown:${key.userId}:${key.commandName}`;
    await this.client.cache.delete(cacheKey);
  }
}
