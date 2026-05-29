import { Event } from '../../structures/Event';
import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS } from '../../constants';

export default new Event({
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    const client = member.client as AxionClient;
    const guildConfig = await GuildModel.findOne({ guildId: member.guild.id });
    if (!guildConfig) return;

    const { ActivityTracker } = await import('../../services/analytics/ActivityTracker');
    const tracker = new ActivityTracker(client);
    await tracker.recordJoin(member.guild.id);

    if (guildConfig.autoroleConfig?.enabled) {
      const roles = member.user.bot ? guildConfig.botAutoRoles : guildConfig.autoRoles;
      for (const roleId of roles) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role).catch(() => {});
        }
      }
    }

    if (guildConfig.welcomeConfig?.enabled && guildConfig.welcomeConfig.channelId) {
      const channel = member.guild.channels.cache.get(guildConfig.welcomeConfig.channelId) as TextChannel;
      if (channel) {
        const message = guildConfig.welcomeConfig.message
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, String(member.guild.memberCount));

        if (guildConfig.welcomeConfig.embed) {
          const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.success)
            .setTitle('Welcome!')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({
              text: `${new Date().toLocaleString()} | Axion — providing premium features for free`,
              iconURL: member.guild.iconURL() ?? undefined,
            });

          await channel.send({ embeds: [embed] }).catch(() => {});
        } else {
          await channel.send({ content: message }).catch(() => {});
        }
      }
    }

    const { InviteTracker } = await import('../../services/analytics/InviteTracker');
    const inviteTracker = new InviteTracker(client);
    await inviteTracker.cacheGuildInvites(member.guild);
  },
});
