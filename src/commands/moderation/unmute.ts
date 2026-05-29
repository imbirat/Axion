import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { WarningModel } from '../../models';

export default new Command({
  name: 'unmute',
  description: 'Remove a timeout from a user',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to unmute', type: 'user', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let target;
    if (isSlash) {
      target = interaction.options.getMember('user');
    } else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await guild.members.fetch(id).catch(() => null) : null;
    }
    if (!target) {
      await interaction.reply({ content: 'User not found.', ephemeral: true });
      return;
    }

    await target.timeout(null);
    await WarningModel.updateMany({ guildId: guild.id, userId: target.id, type: 'mute', active: true }, { active: false });

    const msg = `Unmuted ${target.user.tag}.`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
