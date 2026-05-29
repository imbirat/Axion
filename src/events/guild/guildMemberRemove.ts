import { Event } from '../../structures/Event';
import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS } from '../../constants';

export default new Event({
  name: 'guildMemberRemove',
  async execute(member: GuildMember) {
    const client = member.client as AxionClient;
    const guildConfig = await GuildModel.findOne({ guildId: member.guild.id });
    if (!guildConfig) return;

    const { ActivityTracker } = await import('../../services/analytics/ActivityTracker');
    const tracker = new ActivityTracker(client);
    await tracker.recordLeave(member.guild.id);

    if (guildConfig.farewellConfig?.enabled && guildConfig.farewellConfig.channelId) {
      const channel = member.guild.channels.cache.get(guildConfig.farewellConfig.channelId) as TextChannel;
      if (channel) {
        const message = guildConfig.farewellConfig.message
          .replace(/{user}/g, member.user.tag)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, String(member.guild.memberCount));

        if (guildConfig.farewellConfig.embed) {
          const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.warning)
            .setTitle('Goodbye!')
            .setDescription(message);

          await channel.send({ embeds: [embed] }).catch(() => {});
        } else {
          await channel.send({ content: message }).catch(() => {});
        }
      }
    }
  },
});
