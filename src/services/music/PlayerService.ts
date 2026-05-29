import { GuildMember, TextChannel, VoiceChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { AxionClient } from '../../structures/AxionClient';
import { EMBED_COLORS, MUSIC_CONFIG } from '../../constants';

export class PlayerService {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async ensurePlayer(guildId: string, voiceChannelId: string, textChannelId: string): Promise<KazagumoPlayer> {
    if (!this.client.kazagumo) {
      throw new Error('Music system is not connected');
    }

    let player = this.client.music.getPlayer(guildId);
    if (player) return player;

    player = this.client.kazagumo.createPlayer({
      guildId,
      voiceId: voiceChannelId,
      textId: textChannelId,
      volume: MUSIC_CONFIG.defaultVolume,
    });

    this.client.music.setPlayer(guildId, player);
    return player;
  }

  public async search(query: string, requester: GuildMember): Promise<KazagumoTrack[]> {
    if (!this.client.kazagumo) throw new Error('Music system is not connected');

    const result = await this.client.kazagumo.search(query, { requester });
    return result.tracks;
  }

  public formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 60000) % 60);
    const hours = Math.floor(ms / 3600000);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  public createNowPlayingEmbed(track: KazagumoTrack, player: KazagumoPlayer): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.music)
      .setTitle('Now Playing')
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: 'Author', value: track.author, inline: true },
        { name: 'Duration', value: this.formatDuration(track.length ?? 0), inline: true },
        { name: 'Volume', value: `${player.volume}%`, inline: true },
        { name: 'Queue', value: `${player.queue.length} tracks`, inline: true },
        { name: 'Loop', value: player.loop === 'none' ? 'Off' : player.loop === 'track' ? 'Track' : 'Queue', inline: true },
      )
      .setThumbnail(track.thumbnail ?? null);

    return embed;
  }

  public createPlayerButtons(guildId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`player_skip_${guildId}`).setEmoji('⏭').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`player_pause_${guildId}`).setEmoji('⏯').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`player_loop_${guildId}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`player_volup_${guildId}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`player_stop_${guildId}`).setEmoji('⏹').setStyle(ButtonStyle.Danger),
    );
  }
}
