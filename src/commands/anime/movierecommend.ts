import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'movierecommend',
  description: 'Get a random anime movie recommendation',
  category: 'anime',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    try {
      const page = Math.floor(Math.random() * 10) + 1;
      const res = await axios.get(`https://api.jikan.moe/v4/anime?type=movie&order_by=score&sort=desc&page=${page}&limit=1`);
      const data = res.data.data[0];
      if (!data) { await interaction.reply({ content: 'No recommendation available.', ephemeral: true }); return; }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle('🎬 Anime Movie Recommendation')
        .setDescription(`**${data.title}**`)
        .setURL(data.url)
        .setThumbnail(data.images?.jpg?.image_url ?? null)
        .addFields(
          { name: 'Score', value: String(data.score ?? 'N/A'), inline: true },
          { name: 'Status', value: data.status ?? 'N/A', inline: true },
        );

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Failed to fetch recommendation.', ephemeral: true });
    }
  },
});
