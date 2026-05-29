import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';

export default new Command({
  name: 'ai',
  description: 'AI-powered commands',
  category: 'ai',
  type: 'both',
  options: [
    { name: 'subcommand', description: 'embed or insights', type: 'string', required: true, choices: [{ name: 'embed', value: 'embed' }, { name: 'insights', value: 'insights' }] },
    { name: 'title', description: 'Title for the embed', type: 'string', required: false },
    { name: 'description', description: 'Description for the embed', type: 'string', required: false },
    { name: 'data', description: 'Data for insights', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    if (!client.gemini) { await interaction.reply({ content: 'AI not configured.', ephemeral: true }); return; }

    if (isSlash) {
      const sub = interaction.options.getString('subcommand', true);
      if (sub === 'embed') {
        const title = interaction.options.getString('title') ?? 'AI Embed';
        const description = interaction.options.getString('description') ?? 'AI generated content';
        await interaction.deferReply();
        const result = await client.gemini.generateEmbed(title, description);
        const embed = new EmbedBuilder()
          .setColor(parseInt(result.color.replace('#', ''), 16) || 0x5865f2)
          .setTitle(result.title)
          .setDescription(result.description);
        await interaction.editReply({ embeds: [embed] });
      } else if (sub === 'insights') {
        const data = interaction.options.getString('data') ?? 'No data provided';
        await interaction.deferReply();
        const insights = await client.gemini.generateInsights(data);
        await interaction.editReply({ content: insights.slice(0, 2000) });
      }
    }
  },
});
