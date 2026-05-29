import { readdirSync } from 'fs';
import { join } from 'path';
import { AxionClient } from '../structures/AxionClient';
import { Command } from '../structures/Command';

export class CommandHandler {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async loadCommands(): Promise<void> {
    const commandPaths: string[] = [];
    const commandsDir = join(__dirname, '..', 'commands');

    const categories = readdirSync(commandsDir, { withFileTypes: true });

    for (const category of categories) {
      if (!category.isDirectory()) continue;
      const categoryPath = join(commandsDir, category.name);
      const files = readdirSync(categoryPath).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        commandPaths.push(join(categoryPath, file));
      }
    }

    let loadedCount = 0;
    for (const filePath of commandPaths) {
      try {
        const commandModule = await import(filePath);
        const command: Command = commandModule.default ?? commandModule.command;

        if (!command || !(command instanceof Command)) {
          this.client.logger.warn(`Invalid command export in ${filePath}`);
          continue;
        }

        this.client.commands.set(command.name, command);

        for (const alias of command.aliases) {
          this.client.aliases.set(alias, command.name);
        }

        loadedCount++;
      } catch (error) {
        this.client.logger.error(`Failed to load command ${filePath}:`, error);
      }
    }

    this.client.logger.info(`Loaded ${loadedCount} commands`);
  }

  public async executePrefixCommand(command: Command, message: Message, args: string[]): Promise<void> {
    if (command.ownerOnly && !this.client.isOwner(message.author.id)) {
      await message.reply('This command is owner-only.');
      return;
    }

    if (command.permissions.length > 0 && message.member) {
      const hasPerms = command.permissions.every((perm) => message.member!.permissions.has(perm));
      if (!hasPerms) {
        await message.reply('You do not have permission to use this command.');
        return;
      }
    }

    this.client.metrics.recordCommand(command.name);

    try {
      await command.execute(this.client, message, args);
    } catch (error) {
      this.client.logger.error(`Error executing prefix command ${command.name}:`, error);
      await message.reply('An error occurred while executing this command.').catch(() => {});
    }
  }

  public async reloadCommands(): Promise<void> {
    this.client.commands.clear();
    this.client.aliases.clear();
    await this.loadCommands();
  }
}
