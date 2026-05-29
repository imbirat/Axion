import { Command } from '../../structures/Command';

export default new Command({
  name: 'ping',
  description: 'Shows the bot latency',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const latency = Math.round(client.ws.ping);

    if (isSlash) {
      await interaction.reply({ content: `Pong! 🏓 Latency: ${latency}ms` });
    } else {
      await (interaction as any).reply({ content: `Pong! 🏓 Latency: ${latency}ms` });
    }
  },
});
