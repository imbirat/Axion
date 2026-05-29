import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'meme',
  description: 'Get a random meme',
  category: 'fun',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    try {
      const res = await axios.get('https://meme-api.com/gimme');
      const data = res.data;
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle(data.title)
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups} | r/${data.subreddit}` });
      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      const msg = 'Failed to fetch meme.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
    }
  },
});
