import { Command } from '../../structures/Command';

const questions = [
  'What is the best thing that happened to you today?', 'What is a skill you want to learn?', 'What is your favorite memory?', 'If you could travel anywhere, where would you go?', 'What is the most valuable lesson you have learned?', 'What is your dream job?', 'Who inspires you the most?', 'What is your favorite book/movie?', 'What are you grateful for today?', 'What advice would you give your younger self?',
];

export default new Command({
  name: 'dailyquestion',
  description: 'Get a daily discussion question',
  category: 'social',
  type: 'both',
  async execute(client, interaction) {
    const q = questions[Math.floor(Math.random() * questions.length)];
    if (interaction.isChatInputCommand?.() ?? false) await interaction.reply({ content: `💬 **Daily Question:** ${q}` });
    else await (interaction as any).reply(`💬 **Daily Question:** ${q}`);
  },
});
