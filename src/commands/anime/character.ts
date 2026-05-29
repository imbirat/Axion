import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'character',
  description: 'Search for an anime character',
  category: 'anime',
  type: 'both',
  options: [
    { name: 'name', description: 'Character name', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let query: string;
    if (isSlash) query = interaction.options.getString('name', true);
    else {
      const args = (interaction as any).args as string[];
      query = args?.join(' ') ?? '';
    }

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`);
      const data = res.data.data[0];
      if (!data) { await interaction.reply({ content: 'Character not found.', ephemeral: true }); return; }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle(data.name)
        .setURL(data.url)
        .setDescription(data.about?.slice(0, 1000) ?? 'No description.')
        .setThumbnail(data.images?.jpg?.image_url ?? null);

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Failed to fetch character.', ephemeral: true });
    }
  },
});
