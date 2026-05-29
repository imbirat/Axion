import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { WarningModel, GuildModel } from '../../models';
import ms from 'ms';

export default new Command({
  name: 'mute',
  description: 'Timeout/mute a user',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to mute', type: 'user', required: true },
    { name: 'duration', description: 'Duration (e.g. 10m, 1h)', type: 'string', required: false },
    { name: 'reason', description: 'Reason for mute', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let target, duration = 600000, reason = 'No reason provided';
    if (isSlash) {
      target = interaction.options.getMember('user');
      const durStr = interaction.options.getString('duration');
      if (durStr) duration = ms(durStr) ?? 600000;
      reason = interaction.options.getString('reason') ?? 'No reason provided';
    } else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await guild.members.fetch(id).catch(() => null) : null;
      if (args?.[1]) duration = ms(args[1]) ?? 600000;
      reason = args?.slice(2).join(' ') || 'No reason provided';
    }
    if (!target || !target.moderatable) {
      await interaction.reply({ content: 'I cannot mute that user.', ephemeral: true });
      return;
    }

    await target.timeout(duration, reason);
    const guildConfig = await GuildModel.findOne({ guildId: guild.id });
    const caseId = (guildConfig?.caseId ?? 0) + 1;
    await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $inc: { caseId: 1 } });
    await WarningModel.create({ caseId, guildId: guild.id, userId: target.id, moderatorId: interaction.user?.id ?? (interaction as any).author?.id, type: 'mute', reason, duration, active: true });

    const msg = `Muted ${target.user.tag} for ${ms(duration)} | Case #${caseId}`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
