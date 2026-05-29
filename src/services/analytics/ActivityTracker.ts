import { AxionClient } from '../../structures/AxionClient';
import { AnalyticsModel } from '../../models';

export class ActivityTracker {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async recordMessage(guildId: string, userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;

    await AnalyticsModel.findOneAndUpdate(
      { guildId, date: today },
      {
        $inc: { messages: 1 },
        $addToSet: { activeUsers: userId },
      },
      { upsert: true },
    );
  }

  public async recordJoin(guildId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;

    await AnalyticsModel.findOneAndUpdate(
      { guildId, date: today },
      { $inc: { joins: 1 } },
      { upsert: true },
    );
  }

  public async recordLeave(guildId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;

    await AnalyticsModel.findOneAndUpdate(
      { guildId, date: today },
      { $inc: { leaves: 1 } },
      { upsert: true },
    );
  }

  public async recordCommand(guildId: string, commandName: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;

    await AnalyticsModel.findOneAndUpdate(
      { guildId, date: today },
      { $inc: { [`commandUsage.${commandName}`]: 1 } },
      { upsert: true },
    );
  }

  public async getGuildAnalytics(guildId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return AnalyticsModel.find({
      guildId,
      date: { $gte: startDate.toISOString().split('T')[0] },
    }).sort({ date: 1 });
  }
}
