import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { AnalyticsModel } from '../../models';

export default new Command({
  name: 'serverstats',
  description: 'View server analytics and statistics',
  category: 'analytics',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const { ActivityTracker } = await import('../../services/analytics/ActivityTracker');
    const tracker = new ActivityTracker(client);
    const data = await tracker.getGuildAnalytics(guild.id, 30);

    const totalMessages = data.reduce((acc: number, d: any) => acc + (d.messages ?? 0), 0);
    const totalJoins = data.reduce((acc: number, d: any) => acc + (d.joins ?? 0), 0);
    const totalLeaves = data.reduce((acc: number, d: any) => acc + (d.leaves ?? 0), 0);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(`📊 Server Stats — ${guild.name}`)
      .addFields(
        { name: 'Messages (30d)', value: String(totalMessages), inline: true },
        { name: 'Joins (30d)', value: String(totalJoins), inline: true },
        { name: 'Leaves (30d)', value: String(totalLeaves), inline: true },
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Boosts', value: String(guild.premiumSubscriptionCount ?? 0), inline: true },
        { name: 'Channels', value: String(guild.channels.cache.size), inline: true },
      )
      .setTimestamp();

    if (isSlash) await interaction.reply({ embeds: [embed] });
    else await (interaction as any).reply({ embeds: [embed] });
  },
});
