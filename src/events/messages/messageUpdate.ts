import { Event } from '../../structures/Event';
import { Message, TextChannel, EmbedBuilder, PartialMessage } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS } from '../../constants';

export default new Event({
  name: 'messageUpdate',
  async execute(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
    if (oldMessage.author?.bot) return;
    if (!oldMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;

    const client = oldMessage.client as AxionClient;
    const guildConfig = await GuildModel.findOne({ guildId: oldMessage.guild.id });

    if (!guildConfig?.loggingConfig?.events?.messageEdit) return;

    const logChannelId = guildConfig.loggingConfig.channelId;
    if (!logChannelId) return;

    const logChannel = oldMessage.guild.channels.cache.get(logChannelId) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.warning)
      .setTitle('Message Edited')
      .setDescription(
        `**Author:** ${oldMessage.author?.tag ?? 'Unknown'} (<@${oldMessage.author?.id}>)\n` +
        `**Channel:** ${oldMessage.channel}\n` +
        `**Before:** ${oldMessage.content ?? '[Could not fetch]'}\n` +
        `**After:** ${newMessage.content ?? '[Could not fetch]'}`,
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] }).catch(() => {});
  },
});
