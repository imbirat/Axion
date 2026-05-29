import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'anime',
  description: 'Search for anime or get a random one',
  category: 'anime',
  type: 'both',
  options: [
    { name: 'name', description: 'Anime name or "random"', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let query: string;
    if (isSlash) query = interaction.options.getString('name') ?? 'random';
    else {
      const args = (interaction as any).args as string[];
      query = args?.join(' ') || 'random';
    }

    try {
      let url: string;
      if (query.toLowerCase() === 'random') {
        url = 'https://api.jikan.moe/v4/random/anime';
      } else {
        url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`;
      }
      const res = await axios.get(url);
      const data = query.toLowerCase() === 'random' ? res.data.data : res.data.data[0];
      if (!data) { await interaction.reply({ content: 'Not found.', ephemeral: true }); return; }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle(data.title)
        .setURL(data.url)
        .setDescription(data.synopsis?.slice(0, 1000) ?? 'No synopsis.')
        .setThumbnail(data.images?.jpg?.image_url ?? null)
        .addFields(
          { name: 'Score', value: String(data.score ?? 'N/A'), inline: true },
          { name: 'Episodes', value: String(data.episodes ?? 'N/A'), inline: true },
          { name: 'Status', value: data.status ?? 'N/A', inline: true },
        );

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Failed to fetch anime data.', ephemeral: true });
    }
  },
});
