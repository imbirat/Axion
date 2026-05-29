import { Command } from '../../structures/Command';
import { ComponentType } from 'discord.js';

export default new Command({
  name: 'guessnumber',
  description: 'Guess the hidden number between 1-100',
  category: 'fun',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const number = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    const msg = 'I am thinking of a number between 1 and 100. Type your guess in chat!';
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);

    const filter = (m: any) => m.author.id === interaction.user?.id;
    const channel = interaction.channel;
    if (!channel) return;

    const collector = channel.createMessageCollector({ filter, time: 60000, max: 10 });
    collector.on('collect', async (m: any) => {
      const guess = parseInt(m.content, 10);
      if (isNaN(guess)) return;
      attempts++;

      if (guess === number) {
        await m.reply(`🎉 Correct! The number was ${number}. You got it in ${attempts} attempts!`);
        collector.stop();
      } else if (guess < number) {
        await m.reply('📈 Higher!');
      } else {
        await m.reply('📉 Lower!');
      }
    });

    collector.on('end', async (collected: any, reason: string) => {
      if (reason === 'time') {
        await channel.send(`⏰ Time is up! The number was **${number}**.`);
      }
    });
  },
});
