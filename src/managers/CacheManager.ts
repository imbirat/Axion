import Redis from 'ioredis';
import { AxionClient } from '../structures/AxionClient';
import { CACHE_TTL } from '../constants';

export class CacheManager {
  private client: AxionClient;
  public redis: Redis | null = null;
  private prefix = 'axion:';

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async connect(): Promise<void> {
    if (!this.client.config.redisUrl) {
      this.client.logger.warn('Redis not configured — running without cache');
      return;
    }

    try {
      this.redis = new Redis(this.client.config.redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 5) return null;
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      await this.redis.connect();
      this.client.logger.info('Connected to Redis');
    } catch (error) {
      this.client.logger.error('Redis connection failed:', error);
      this.redis = null;
    }
  }

  private key(namespace: string, id: string): string {
    return `${this.prefix}${namespace}:${id}`;
  }

  public async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch {
      return null;
    }
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch {
      // Silently fail
    }
  }

  public async delete(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch {
      // Silently fail
    }
  }

  public async getJSON<T>(namespace: string, id: string): Promise<T | null> {
    const data = await this.get(this.key(namespace, id));
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  public async setJSON(namespace: string, id: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.set(this.key(namespace, id), JSON.stringify(value), ttlSeconds);
  }

  public async invalidate(namespace: string, id?: string): Promise<void> {
    if (!this.redis) return;

    if (id) {
      await this.delete(this.key(namespace, id));
    } else {
      const pattern = `${this.prefix}${namespace}:*`;
      const stream = this.redis.scanStream({ match: pattern });
      const pipeline = this.redis.pipeline();

      stream.on('data', (keys: string[]) => {
        for (const key of keys) {
          pipeline.del(key);
        }
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('end', async () => {
          try {
            await pipeline.exec();
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        stream.on('error', reject);
      });
    }
  }

  public async cacheGuildConfig(guildId: string, config: Record<string, unknown>): Promise<void> {
    await this.setJSON('guild', guildId, config, CACHE_TTL.guildConfig);
  }

  public async getGuildConfig(guildId: string): Promise<Record<string, unknown> | null> {
    return this.getJSON<Record<string, unknown>>('guild', guildId);
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    try {
      return (await this.redis.exists(key)) === 1;
    } catch {
      return false;
    }
  }

  public async increment(key: string): Promise<number> {
    if (!this.redis) return 0;
    try {
      return await this.redis.incr(key);
    } catch {
      return 0;
    }
  }

  public async expire(key: string, seconds: number): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.expire(key, seconds);
    } catch {
      // Silently fail
    }
  }

  public async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}
