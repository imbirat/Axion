import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'slowmode',
  description: 'Set slowmode in the channel',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
  type: 'both',
  options: [
    { name: 'seconds', description: 'Slowmode duration in seconds (0 to disable)', type: 'integer', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;

    let seconds: number;
    if (isSlash) {
      seconds = interaction.options.getInteger('seconds', true);
    } else {
      const args = (interaction as any).args as string[];
      seconds = parseInt(args?.[0] ?? '0', 10);
    }

    await (channel as any).setRateLimitPerUser(seconds);
    const msg = seconds > 0 ? `Slowmode set to ${seconds}s.` : 'Slowmode disabled.';
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
