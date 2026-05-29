import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { WarningModel, GuildModel } from '../../models';

export default new Command({
  name: 'warn',
  description: 'Warn a user',
  category: 'moderation',
  permissions: [PermissionFlagsBits.ModerateMembers],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to warn', type: 'user', required: true },
    { name: 'reason', description: 'Reason for the warning', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let target, reason = 'No reason provided';
    if (isSlash) {
      target = interaction.options.getUser('user');
      reason = interaction.options.getString('reason') ?? 'No reason provided';
    } else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await client.users.fetch(id).catch(() => null) : null;
      reason = args?.slice(1).join(' ') || 'No reason provided';
    }
    if (!target) return;

    const guildConfig = await GuildModel.findOne({ guildId: guild.id });
    const caseId = (guildConfig?.caseId ?? 0) + 1;
    await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $inc: { caseId: 1 } });

    await WarningModel.create({ caseId, guildId: guild.id, userId: target.id, moderatorId: interaction.user?.id ?? (interaction as any).author?.id, type: 'warn', reason, active: true });

    const msg = `Warned ${target.tag} | Case #${caseId}`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
