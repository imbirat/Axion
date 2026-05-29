import { Command } from '../../structures/Command';

export default new Command({
  name: 'summarize',
  description: 'Summarize a block of text using AI',
  category: 'ai',
  type: 'both',
  options: [
    { name: 'text', description: 'Text to summarize', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let text: string;
    if (isSlash) {
      text = interaction.options.getString('text', true);
    } else {
      const args = (interaction as any).args as string[];
      text = args?.join(' ') ?? '';
    }

    if (!client.gemini) { await interaction.reply({ content: 'AI not configured.', ephemeral: true }); return; }
    if (isSlash) await interaction.deferReply();

    try {
      const summary = await client.gemini.summariseContent(text);
      if (isSlash) await interaction.editReply({ content: summary.slice(0, 2000) });
      else await (interaction as any).reply(summary.slice(0, 2000));
    } catch {
      const msg = 'Failed to summarize.';
      if (isSlash) await interaction.editReply({ content: msg });
      else await (interaction as any).reply(msg);
    }
  },
});
