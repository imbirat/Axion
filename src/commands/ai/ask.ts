import { Command } from '../../structures/Command';

export default new Command({
  name: 'ask',
  description: 'Ask the AI a question',
  category: 'ai',
  type: 'both',
  options: [
    { name: 'question', description: 'Your question', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let question: string;
    if (isSlash) {
      question = interaction.options.getString('question', true);
    } else {
      const args = (interaction as any).args as string[];
      question = args?.join(' ') ?? '';
    }

    if (!client.gemini) {
      await interaction.reply({ content: 'AI is not configured.', ephemeral: true });
      return;
    }

    if (isSlash) await interaction.deferReply();

    try {
      const response = await client.gemini.chat(
        interaction.user?.id ?? (interaction as any).author?.id,
        guild.id,
        question,
      );
      if (isSlash) await interaction.editReply({ content: response.slice(0, 2000) });
      else await (interaction as any).reply(response.slice(0, 2000));
    } catch (error: any) {
      const msg = error.message || 'AI request failed.';
      if (isSlash) {
        if (interaction.deferred) await interaction.editReply({ content: msg });
        else await interaction.reply({ content: msg, ephemeral: true });
      } else {
        await (interaction as any).reply(msg);
      }
    }
  },
});
