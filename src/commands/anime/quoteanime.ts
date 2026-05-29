import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'quoteanime',
  description: 'Get a random anime quote',
  category: 'anime',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    try {
      const res = await axios.get('https://animechan.xyz/api/random');
      const data = res.data;
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle(`"${data.quote}"`)
        .setFooter({ text: `— ${data.character} (${data.anime})` });

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Failed to fetch quote.', ephemeral: true });
    }
  },
});
