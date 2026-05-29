import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'nowplaying',
  description: 'Shows the currently playing track',
  category: 'music',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const player = client.music.getPlayer(guild.id);
    const currentTrack = player?.queue?.current;
    if (!currentTrack) {
      const msg = 'No music is playing.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const position = player!.position ?? 0;
    const duration = currentTrack.length ?? 0;
    const progress = duration > 0 ? Math.round((position / duration) * 20) : 0;
    const bar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(Math.max(0, 20 - progress));

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.music)
      .setTitle('Now Playing')
      .setDescription(`**[${currentTrack.title}](${currentTrack.uri})**\n\n${bar}\n\`${formatTime(position)} / ${formatTime(duration)}\``)
      .addFields(
        { name: 'Author', value: currentTrack.author, inline: true },
        { name: 'Volume', value: `${player!.volume}%`, inline: true },
      )
      .setThumbnail(currentTrack.thumbnail ?? null);

    if (isSlash) await interaction.reply({ embeds: [embed] });
    else await (interaction as any).reply({ embeds: [embed] });
  },
});

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
