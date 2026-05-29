import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { getSnipe } from '../../events/messages/messageDelete';

export default new Command({
  name: 'snipe',
  description: 'Shows the last deleted message in the channel',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) {
      const msg = 'This command can only be used in a text channel.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const snipe = getSnipe(channel.id);
    if (!snipe) {
      const msg = 'No recently deleted messages found.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.warning)
      .setTitle('Snipe')
      .setDescription(snipe.content)
      .setFooter({ text: `Deleted by ${snipe.author}` })
      .setTimestamp(snipe.timestamp);

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await (interaction as any).reply({ embeds: [embed] });
    }
  },
});
