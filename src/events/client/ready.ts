import { Event } from '../../structures/Event';
import { ActivityType } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';

export default new Event({
  name: 'ready',
  once: true,
  async execute(...args: unknown[]) {
    const client = args[0] as AxionClient;

    client.logger.info(`Logged in as ${client.user?.tag}`);
    client.metrics.updateGuildStats();

    await client.gemini.init();

    client.user?.setPresence({
      activities: [{ name: '/help | Axion', type: ActivityType.Watching }],
      status: 'online',
    });

    const commands = [];
    for (const command of client.commands.values()) {
      if (command.type === 'slash' || command.type === 'both') {
        commands.push(command.toSlashCommand().toJSON());
      }
    }

    try {
      await client.application?.commands.set(commands);
      client.logger.info(`Registered ${commands.length} slash commands`);
    } catch (error) {
      client.logger.error('Failed to register slash commands:', error);
    }
  },
});
