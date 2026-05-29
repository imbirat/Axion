import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'queue',
  description: 'View the music queue',
  category: 'music',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const player = client.music.getPlayer(guild.id);
    if (!player || (!player.playing && player.queue.isEmpty())) {
      const msg = 'No music is playing.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const queue = player.queue;
    const currentTrack = player.queue.current;
    const tracks = queue.map((t: any, i: number) => `${i + 1}. **[${t.title}](${t.uri})** — ${t.author}`);
    const totalLength = queue.reduce((acc: number, t: any) => acc + (t.length ?? 0), 0);
    const totalMinutes = Math.floor(totalLength / 60000);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.music)
      .setTitle('Music Queue')
      .setDescription(
        `**Now Playing:** ${currentTrack ? `[${currentTrack.title}](${currentTrack.uri})` : 'None'}\n\n` +
        (tracks.length > 0 ? tracks.slice(0, 10).join('\n') : 'No tracks in queue.') +
        (tracks.length > 10 ? `\n\n...and ${tracks.length - 10} more tracks.` : ''),
      )
      .addFields(
        { name: 'Total Tracks', value: String(tracks.length), inline: true },
        { name: 'Total Duration', value: `${totalMinutes} min`, inline: true },
        { name: 'Loop', value: player.loop === 'none' ? 'Off' : player.loop === 'track' ? 'Track' : 'Queue', inline: true },
      );

    if (isSlash) await interaction.reply({ embeds: [embed] });
    else await (interaction as any).reply({ embeds: [embed] });
  },
});
