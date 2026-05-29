import { readdirSync } from 'fs';
import { join } from 'path';
import { AxionClient } from '../structures/AxionClient';
import { Component } from '../structures/Component';

export class ComponentHandler {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async loadComponents(): Promise<void> {
    const componentsDir = join(__dirname, '..', 'components');

    try {
      const categories = readdirSync(componentsDir, { withFileTypes: true });

      for (const category of categories) {
        if (!category.isDirectory()) continue;
        const categoryPath = join(componentsDir, category.name);
        const files = readdirSync(categoryPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
          try {
            const componentModule = await import(join(categoryPath, file));
            const component: Component = componentModule.default ?? componentModule.component;

            if (!component || !(component instanceof Component)) {
              this.client.logger.warn(`Invalid component export in ${join(categoryPath, file)}`);
              continue;
            }

            this.client.components.set(component.customId, component);
          } catch (error) {
            this.client.logger.error(`Failed to load component ${join(categoryPath, file)}:`, error);
          }
        }
      }
    } catch {
      // components directory may not exist
    }
  }
}
