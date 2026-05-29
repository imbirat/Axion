import { Event } from '../../structures/Event';
import { VoiceState, TextChannel, EmbedBuilder } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS } from '../../constants';

export default new Event({
  name: 'voiceStateUpdate',
  async execute(oldState: VoiceState, newState: VoiceState) {
    const client = oldState.client as AxionClient;
    const guildId = oldState.guild.id || newState.guild.id;
    if (!guildId) return;

    const guildConfig = await GuildModel.findOne({ guildId });

    if (guildConfig?.loggingConfig?.events?.voiceState) {
      const logChannelId = guildConfig.loggingConfig.channelId;
      if (logChannelId) {
        const logChannel = oldState.guild?.channels.cache.get(logChannelId) as TextChannel ?? newState.guild?.channels.cache.get(logChannelId) as TextChannel;
        if (logChannel) {
          let description = '';
          if (!oldState.channelId && newState.channelId) {
            description = `**${newState.member?.user.tag}** joined voice channel **${newState.channel?.name}**`;
          } else if (oldState.channelId && !newState.channelId) {
            description = `**${oldState.member?.user.tag}** left voice channel **${oldState.channel?.name}**`;
          } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            description = `**${newState.member?.user.tag}** moved from **${oldState.channel?.name}** to **${newState.channel?.name}**`;
          }

          if (description) {
            const embed = new EmbedBuilder()
              .setColor(EMBED_COLORS.info)
              .setTitle('Voice State Update')
              .setDescription(description)
              .setTimestamp();

            await logChannel.send({ embeds: [embed] }).catch(() => {});
          }
        }
      }
    }

    if (oldState.channelId && !newState.channelId) {
      const player = client.music.getPlayer(guildId);
      if (player && oldState.member?.id === client.user?.id) {
        setTimeout(async () => {
          const currentPlayer = client.music.getPlayer(guildId);
          if (currentPlayer && !currentPlayer.playing) {
            currentPlayer.destroy();
            client.music.removePlayer(guildId);
          }
        }, 300_000);
      }
    }
  },
});
