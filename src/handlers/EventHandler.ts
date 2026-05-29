import { readdirSync } from 'fs';
import { join } from 'path';
import { AxionClient } from '../structures/AxionClient';
import { Event } from '../structures/Event';

export class EventHandler {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async loadEvents(): Promise<void> {
    const eventsDir = join(__dirname, '..', 'events');
    const categories = readdirSync(eventsDir, { withFileTypes: true });
    let loadedCount = 0;

    for (const category of categories) {
      if (!category.isDirectory()) continue;
      const categoryPath = join(eventsDir, category.name);
      const files = readdirSync(categoryPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        try {
          const eventModule = await import(join(categoryPath, file));
          const event: Event = eventModule.default ?? eventModule.event;

          if (!event || !(event instanceof Event)) {
            this.client.logger.warn(`Invalid event export in ${join(categoryPath, file)}`);
            continue;
          }

          this.client.events.set(event.name, event);

          if (event.once) {
            this.client.once(event.name, (...args: unknown[]) => event.execute(...args));
          } else {
            this.client.on(event.name, (...args: unknown[]) => event.execute(...args));
          }

          loadedCount++;
        } catch (error) {
          this.client.logger.error(`Failed to load event ${join(categoryPath, file)}:`, error);
        }
      }
    }

    this.client.logger.info(`Loaded ${loadedCount} events`);
  }
}
