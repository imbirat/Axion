import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { WarningModel, GuildModel } from '../../models';

export default new Command({
  name: 'ban',
  description: 'Ban a user from the server',
  category: 'moderation',
  permissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
  type: 'both',
  options: [
    { name: 'user', description: 'The user to ban', type: 'user', required: true },
    { name: 'reason', description: 'Reason for the ban', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) {
      if (isSlash) await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      else await (interaction as any).reply('This command can only be used in a server.');
      return;
    }

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

    if (!target) {
      if (isSlash) await interaction.reply({ content: 'Invalid user.', ephemeral: true });
      else await (interaction as any).reply('Invalid user.');
      return;
    }

    if (target.id === guild.ownerId) {
      if (isSlash) await interaction.reply({ content: 'You cannot ban the server owner.', ephemeral: true });
      else await (interaction as any).reply('You cannot ban the server owner.');
      return;
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      if (isSlash) await interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
      else await (interaction as any).reply('I cannot ban this user.');
      return;
    }

    const guildConfig = await GuildModel.findOne({ guildId: guild.id });
    const caseId = (guildConfig?.caseId ?? 0) + 1;
    await GuildModel.findOneAndUpdate({ guildId: guild.id }, { $inc: { caseId: 1 } });

    await WarningModel.create({
      caseId,
      guildId: guild.id,
      userId: target.id,
      moderatorId: interaction.user?.id ?? (interaction as any).author?.id,
      type: 'ban',
      reason,
      active: true,
    });

    const dmEmbed = new EmbedBuilder()
      .setColor(EMBED_COLORS.error)
      .setTitle(`Banned from ${guild.name}`)
      .setDescription(`**Reason:** ${reason}`);

    await target.send({ embeds: [dmEmbed] }).catch(() => {});

    await guild.bans.create(target.id, { reason, deleteMessageSeconds: 86400 });

    const msg = `Banned ${target.tag} | Case #${caseId}`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);

    if (guildConfig?.modLogChannel) {
      const logChannel = guild.channels.cache.get(guildConfig.modLogChannel);
      if (logChannel?.isTextBased()) {
        const logEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.error)
          .setTitle('Ban')
          .addFields(
            { name: 'User', value: `${target.tag} (<@${target.id}>)` },
            { name: 'Moderator', value: `<@${interaction.user?.id ?? (interaction as any).author?.id}>` },
            { name: 'Reason', value: reason },
            { name: 'Case', value: `#${caseId}` },
          )
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }
  },
});
