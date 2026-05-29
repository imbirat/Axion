import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'waifu',
  description: 'Get a random waifu image',
  category: 'anime',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle('✨ Random Waifu')
        .setImage(res.data.url);

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Failed to fetch waifu.', ephemeral: true });
    }
  },
});
