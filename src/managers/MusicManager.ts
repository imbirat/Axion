import { GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { AxionClient } from '../structures/AxionClient';
import { PlayerState, TrackData } from '../types';

export class MusicManager {
  private client: AxionClient;
  public players: Map<string, KazagumoPlayer>;
  public nowPlayingMessages: Map<string, string>;

  constructor(client: AxionClient) {
    this.client = client;
    this.players = new Map();
    this.nowPlayingMessages = new Map();
  }

  public getPlayer(guildId: string): KazagumoPlayer | undefined {
    return this.players.get(guildId);
  }

  public setPlayer(guildId: string, player: KazagumoPlayer): void {
    this.players.set(guildId, player);
  }

  public removePlayer(guildId: string): void {
    this.players.delete(guildId);
    this.nowPlayingMessages.delete(guildId);
  }

  public async play(
    guildId: string,
    query: string,
    member: GuildMember,
    channel: TextChannel,
  ): Promise<{ track: KazagumoTrack | undefined; type: 'track' | 'playlist' | 'search'; playlistName?: string }> {
    if (!this.client.kazagumo) {
      throw new Error('Music system is not connected');
    }

    const voiceChannel = member.voice.channel as VoiceChannel;
    if (!voiceChannel) {
      throw new Error('You must be in a voice channel');
    }

    let player = this.getPlayer(guildId);
    if (!player) {
      player = this.client.kazagumo.createPlayer({
        guildId,
        voiceId: voiceChannel.id,
        textId: channel.id,
        volume: 80,
      });

      this.setPlayer(guildId, player);

      player.on('start', (track: KazagumoTrack) => {
        this.handleTrackStart(guildId, track, channel);
      });

      player.on('end', () => {
        this.handleTrackEnd(guildId, channel);
      });

      player.on('empty', () => {
        setTimeout(() => {
          if (player && player.queue.isEmpty() && !player.playing) {
            player.destroy();
            this.removePlayer(guildId);
          }
        }, 300_000);
      });

      player.on('error', (error: Error) => {
        this.client.logger.error(`Player error in ${guildId}:`, error);
      });
    }

    const result = await this.client.kazagumo.search(query, { requester: member });

    if (!result || !result.tracks || result.tracks.length === 0) {
      throw new Error('No results found');
    }

    if (result.type === 'PLAYLIST') {
      for (const track of result.tracks) {
        player.queue.add(track);
      }
      if (!player.playing) {
        await player.play();
      }
      return {
        track: undefined,
        type: 'playlist',
        playlistName: result.playlistName ?? undefined,
      };
    }

    const track = result.tracks[0]!;
    player.queue.add(track);

    if (!player.playing) {
      await player.play();
    }

    return { track, type: result.tracks.length > 1 ? 'search' : 'track' };
  }

  private async handleTrackStart(
    guildId: string,
    track: KazagumoTrack,
    channel: TextChannel,
  ): Promise<void> {
    try {
      const embed = this.client.gemini ? undefined : undefined;
      const { EmbedBuilder } = await import('discord.js');
      const { EMBED_COLORS } = await import('../constants');

      const nowPlaying = new EmbedBuilder()
        .setColor(EMBED_COLORS.music)
        .setTitle('Now Playing')
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
          { name: 'Author', value: track.author, inline: true },
          { name: 'Duration', value: this.formatDuration(track.length ?? 0), inline: true },
        )
        .setThumbnail(track.thumbnail ?? null);

      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`player_skip_${guildId}`).setEmoji('⏭').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`player_pause_${guildId}`).setEmoji('⏯').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`player_loop_${guildId}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`player_volup_${guildId}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`player_stop_${guildId}`).setEmoji('⏹').setStyle(ButtonStyle.Danger),
      );

      const msg = await channel.send({ embeds: [nowPlaying], components: [row] });
      this.nowPlayingMessages.set(guildId, msg.id);
    } catch (error) {
      this.client.logger.error(`Error sending now-playing for ${guildId}:`, error);
    }
  }

  private async handleTrackEnd(guildId: string, channel: TextChannel): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) return;

    if (player.queue.isEmpty()) {
      if (player.autoplay) {
        // Autoplay would be handled here
      } else {
        setTimeout(() => {
          if (player && player.queue.isEmpty() && !player.playing) {
            player.destroy();
            this.removePlayer(guildId);
            channel.send('Queue ended. Left voice channel.').catch(() => {});
          }
        }, 300_000);
      }
    }
  }

  public async skip(guildId: string): Promise<KazagumoTrack | undefined> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');

    const next = await player.skip();
    return next ?? undefined;
  }

  public async stop(guildId: string): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');

    player.queue.clear();
    await player.stop();
    player.destroy();
    this.removePlayer(guildId);
  }

  public async pause(guildId: string): Promise<boolean> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');

    if (player.paused) {
      await player.pause(false);
      return false;
    } else {
      await player.pause(true);
      return true;
    }
  }

  public async setVolume(guildId: string, volume: number): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');
    await player.setVolume(volume);
  }

  public async setLoop(guildId: string): Promise<'none' | 'track' | 'queue'> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');

    if (player.loop === 'none') {
      await player.setLoop('track');
      return 'track';
    } else if (player.loop === 'track') {
      await player.setLoop('queue');
      return 'queue';
    } else {
      await player.setLoop('none');
      return 'none';
    }
  }

  public async shuffle(guildId: string): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');
    player.queue.shuffle();
  }

  public async seek(guildId: string, position: number): Promise<void> {
    const player = this.getPlayer(guildId);
    if (!player) throw new Error('No active player');
    await player.seek(position * 1000);
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
