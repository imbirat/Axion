import { Command } from '../../structures/Command';
import { PermissionFlagsBits, ChannelType, OverwriteType } from 'discord.js';

export default new Command({
  name: 'lock',
  description: 'Lock a channel (prevent messages)',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;
    await channel.permissionOverwrites.edit(channel.guild.id, { SendMessages: false }, { type: OverwriteType.Role });
    const msg = '🔒 Channel locked.';
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
