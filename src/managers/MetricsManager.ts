import { AxionClient } from '../structures/AxionClient';

interface MetricsData {
  commandUsage: Map<string, number>;
  guildCount: number;
  userCount: number;
  errorCount: number;
  commandsExecuted: number;
  startTime: number;
  errors: { type: string; count: number }[];
}

export class MetricsManager {
  private client: AxionClient;
  private metrics: MetricsData;

  constructor(client: AxionClient) {
    this.client = client;
    this.metrics = {
      commandUsage: new Map(),
      guildCount: 0,
      userCount: 0,
      errorCount: 0,
      commandsExecuted: 0,
      startTime: Date.now(),
      errors: [],
    };
  }

  public recordCommand(commandName: string): void {
    this.metrics.commandsExecuted++;
    const current = this.metrics.commandUsage.get(commandName) ?? 0;
    this.metrics.commandUsage.set(commandName, current + 1);
  }

  public recordError(type: string): void {
    this.metrics.errorCount++;
    const existing = this.metrics.errors.find((e) => e.type === type);
    if (existing) {
      existing.count++;
    } else {
      this.metrics.errors.push({ type, count: 1 });
    }
  }

  public async updateGuildStats(): Promise<void> {
    this.metrics.guildCount = this.client.guilds.cache.size;
    let totalUsers = 0;
    for (const guild of this.client.guilds.cache.values()) {
      totalUsers += guild.memberCount ?? 0;
    }
    this.metrics.userCount = totalUsers;
  }

  public getMetrics(): MetricsData {
    return { ...this.metrics };
  }

  public getUptime(): number {
    return Date.now() - this.metrics.startTime;
  }

  public getCommandStats(): { name: string; count: number }[] {
    return Array.from(this.metrics.commandUsage.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }
}
