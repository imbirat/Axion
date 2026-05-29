import { Command } from '../../structures/Command';

const truths = [
  'What is your biggest fear?', 'What is the most embarrassing thing you have done?', 'Have you ever lied to your best friend?', 'What is your guilty pleasure?', 'Who is your secret crush?', 'What is the worst date you have been on?', 'Have you ever cheated on a test?', 'What is the most illegal thing you have done?', 'What is your biggest insecurity?', 'What is a secret you have never told anyone?',
];

export default new Command({
  name: 'truth',
  description: 'Get a truth question',
  category: 'social',
  type: 'both',
  async execute(client, interaction) {
    const q = truths[Math.floor(Math.random() * truths.length)];
    if (interaction.isChatInputCommand?.() ?? false) await interaction.reply({ content: `🤔 ${q}` });
    else await (interaction as any).reply(`🤔 ${q}`);
  },
});
