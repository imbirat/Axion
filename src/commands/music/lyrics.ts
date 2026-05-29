import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import axios from 'axios';

export default new Command({
  name: 'lyrics',
  description: 'Get lyrics for the current or specified song',
  category: 'music',
  type: 'both',
  options: [
    { name: 'song', description: 'Song name (optional)', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;

    let query: string | null = null;
    if (isSlash) {
      query = interaction.options.getString('song');
    } else {
      const args = (interaction as any).args as string[];
      query = args?.join(' ') || null;
    }

    if (!query && guild) {
      const player = client.music.getPlayer(guild.id);
      const current = player?.queue?.current;
      if (current) query = `${current.author} ${current.title}`;
    }

    if (!query) {
      const msg = 'No song specified and nothing is playing.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    try {
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query.split(' ')[0] ?? '')}/${encodeURIComponent(query)}`);
      const lyrics = res.data.lyrics as string;
      if (!lyrics) throw new Error('No lyrics found');

      const truncated = lyrics.length > 4000 ? lyrics.slice(0, 4000) + '...' : lyrics;
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.music)
        .setTitle(`Lyrics: ${query}`)
        .setDescription(truncated);

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      const msg = 'Could not find lyrics for that song.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
    }
  },
});
