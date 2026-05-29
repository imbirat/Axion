import { Event } from '../../structures/Event';
import { Message, TextChannel, EmbedBuilder, PartialMessage } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS } from '../../constants';

const snipeCache = new Map<string, { content: string; author: string; timestamp: Date }>();

export function getSnipe(channelId: string) {
  return snipeCache.get(channelId);
}

export default new Event({
  name: 'messageDelete',
  async execute(message: Message | PartialMessage) {
    if (message.author?.bot) return;
    if (!message.guild) return;

    const client = message.client as AxionClient;
    const guildConfig = await GuildModel.findOne({ guildId: message.guild.id });

    snipeCache.set(message.channel.id, {
      content: message.content ?? '[Embed/Attachment]',
      author: message.author?.tag ?? 'Unknown',
      timestamp: new Date(),
    });

    setTimeout(() => snipeCache.delete(message.channel.id), 60000);

    if (!guildConfig?.loggingConfig?.events?.messageDelete) return;

    const logChannelId = guildConfig.loggingConfig.channelId;
    if (!logChannelId) return;

    const logChannel = message.guild.channels.cache.get(logChannelId) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.error)
      .setTitle('Message Deleted')
      .setDescription(`**Author:** ${message.author?.tag ?? 'Unknown'} (<@${message.author?.id}>)\n**Channel:** ${message.channel}\n**Content:** ${message.content ?? '[Content could not be fetched]'}`)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] }).catch(() => {});
  },
});
