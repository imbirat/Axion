import { Event } from '../../structures/Event';
import { Guild, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, AuditLogEvent } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS, SUPPORT_SERVER, INVITE_LINK } from '../../constants';

export default new Event({
  name: 'guildCreate',
  async execute(guild: Guild) {
    const client = guild.client as AxionClient;

    await GuildModel.findOneAndUpdate(
      { guildId: guild.id },
      { guildId: guild.id, prefix: ['.'] },
      { upsert: true },
    );

    client.metrics.updateGuildStats();

    try {
      const auditLogs = await guild.fetchAuditLogs({ limit: 1, actionType: AuditLogEvent.BotAdd });
      const firstEntry = auditLogs.entries.first();
      const inviter: User | null = firstEntry?.executor ?? null;

      if (inviter && !inviter.bot) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.primary)
          .setTitle('Thanks for adding me!')
          .setDescription(
            `Thank you for adding **Axion** to your server!\n\n` +
            `Type \`/help\` for commands\n` +
            `Type \`/botinfo\` for bot info\n` +
            `Join the support server for more info`,
          )
          .setFooter({ text: 'Axion providing premium features for free' });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setURL(SUPPORT_SERVER),
          new ButtonBuilder()
            .setLabel('Invite Bot')
            .setStyle(ButtonStyle.Link)
            .setURL(INVITE_LINK),
        );

        await inviter.send({ embeds: [embed], components: [row] }).catch(() => {});
      }
    } catch {
      // Cannot send DM
    }
  },
});
