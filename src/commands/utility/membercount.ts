import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'membercount',
  description: 'Shows the member count of the server',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) {
      const msg = 'This command can only be used in a server.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle('Members')
      .setDescription(String(guild.memberCount))
      .setFooter({ text: new Date().toLocaleString() });

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await (interaction as any).reply({ embeds: [embed] });
    }
  },
});
