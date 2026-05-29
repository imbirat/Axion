import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { WarningModel, GuildModel } from '../../models';

export default new Command({
  name: 'kick',
  description: 'Kick a user from the server',
  category: 'moderation',
  permissions: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to kick', type: 'user', required: true },
    { name: 'reason', description: 'Reason for the kick', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let target, reason = 'No reason provided';
    if (isSlash) {
      target = interaction.options.getMember('user');
      reason = interaction.options.getString('reason') ?? 'No reason provided';
    } else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await guild.members.fetch(id).catch(() => null) : null;
      reason = args?.slice(1).join(' ') || 'No reason provided';
    }

    if (!target || !target.kickable) {
      await interaction.reply({ content: 'I cannot kick that user.', ephemeral: true });
      return;
    }

    const guildConfig = await GuildModel.findOne({ guildId: guild.id });
    const caseId = (guildConfig?.caseId ?? 0) + 1;
    await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $inc: { caseId: 1 } });

    await WarningModel.create({ caseId, guildId: guild.id, userId: target.id, moderatorId: interaction.user?.id ?? (interaction as any).author?.id, type: 'kick', reason, active: true });

    await target.kick(reason);
    const msg = `Kicked ${target.user.tag} | Case #${caseId}`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);

    if (guildConfig?.modLogChannel) {
      const logChannel = guild.channels.cache.get(guildConfig.modLogChannel);
      if (logChannel?.isTextBased()) {
        const logEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.warning)
          .setTitle('Kick').addFields({ name: 'User', value: `${target.user.tag} (<@${target.id}>)` }, { name: 'Moderator', value: `<@${interaction.user?.id ?? (interaction as any).author?.id}>` }, { name: 'Reason', value: reason }, { name: 'Case', value: `#${caseId}` }).setTimestamp();
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }
  },
});
