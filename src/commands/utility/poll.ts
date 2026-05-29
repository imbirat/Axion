import { Command } from '../../structures/Command';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'poll',
  description: 'Create a quick lightweight poll',
  category: 'utility',
  type: 'both',
  options: [
    { name: 'question', description: 'Poll question', type: 'string', required: true },
    { name: 'option1', description: 'Option 1', type: 'string', required: true },
    { name: 'option2', description: 'Option 2', type: 'string', required: true },
    { name: 'option3', description: 'Option 3', type: 'string', required: false },
    { name: 'option4', description: 'Option 4', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    if (isSlash) {
      const question = interaction.options.getString('question', true);
      const opt1 = interaction.options.getString('option1', true);
      const opt2 = interaction.options.getString('option2', true);
      const opt3 = interaction.options.getString('option3');
      const opt4 = interaction.options.getString('option4');

      const options = [opt1, opt2];
      if (opt3) options.push(opt3);
      if (opt4) options.push(opt4);

      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
      const desc = options.map((o, i) => `${emojis[i] ?? '❓'} ${o}`).join('\n');

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle(`📊 ${question}`)
        .setDescription(desc)
        .setFooter({ text: 'React to vote!' });

      await interaction.reply({ embeds: [embed] });
      const msg = await interaction.fetchReply();

      for (let i = 0; i < options.length; i++) {
        await msg.react(emojis[i]!).catch(() => {});
      }
    }
  },
});
