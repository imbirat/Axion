import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'clear',
  description: 'Clear messages from the channel',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
  type: 'both',
  options: [
    { name: 'amount', description: 'Number of messages to clear', type: 'integer', required: true },
    { name: 'from', description: 'Only clear messages from this user', type: 'user', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;

    let amount = 10;
    let fromUser = null;
    if (isSlash) {
      amount = interaction.options.getInteger('amount', true);
      fromUser = interaction.options.getUser('from');
    } else {
      const args = (interaction as any).args as string[];
      amount = parseInt(args?.[0] ?? '10', 10);
      const fromId = args?.[1]?.replace(/[<@!>]/g, '');
      if (fromId) fromUser = await client.users.fetch(fromId).catch(() => null);
    }

    amount = Math.min(Math.max(amount, 1), 100);

    if (fromUser) {
      const messages = await channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter((m) => m.author.id === fromUser.id).first(amount);
      await (channel as any).bulkDelete(userMessages, true);
      if (isSlash) await interaction.reply({ content: `Cleared ${userMessages.length} messages from ${fromUser.tag}.`, ephemeral: true });
    } else {
      await (channel as any).bulkDelete(amount, true);
      if (isSlash) await interaction.reply({ content: `Cleared ${amount} messages.`, ephemeral: true });
    }
  },
});
