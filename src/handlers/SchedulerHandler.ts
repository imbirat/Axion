import { AxionClient } from '../structures/AxionClient';
import cron from 'node-cron';

export class SchedulerHandler {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async loadSchedulers(): Promise<void> {
    const schedulersDir = __dirname.replace('handlers', 'schedulers');
    try {
      const { readdirSync } = await import('fs');
      const { join } = await import('path');
      const files = readdirSync(schedulersDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        try {
          const schedulerModule = await import(join(schedulersDir, file));
          const scheduler = schedulerModule.default ?? schedulerModule.scheduler;
          if (scheduler && scheduler.name && scheduler.schedule) {
            if (cron.validate(scheduler.schedule)) {
              cron.schedule(scheduler.schedule, () => scheduler.execute(this.client));
              this.client.logger.info(`Scheduler loaded: ${scheduler.name}`);
            }
          }
        } catch (error) {
          this.client.logger.error(`Failed to load scheduler ${file}:`, error);
        }
      }
    } catch {
      this.client.logger.warn('No schedulers directory found');
    }
  }
}
