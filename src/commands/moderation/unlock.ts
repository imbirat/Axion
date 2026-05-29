import { Command } from '../../structures/Command';
import { PermissionFlagsBits, OverwriteType } from 'discord.js';

export default new Command({
  name: 'unlock',
  description: 'Unlock a channel',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;
    await channel.permissionOverwrites.edit(channel.guild.id, { SendMessages: null }, { type: OverwriteType.Role });
    const msg = '🔓 Channel unlocked.';
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
