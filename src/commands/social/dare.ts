import { Command } from '../../structures/Command';

const dares = [
  'Do your best impression of a celebrity.', 'Sing the chorus of your favorite song.', 'Speak in an accent for the next 3 rounds.', 'Do 10 pushups right now.', 'Send a text to the 5th person in your contacts.', 'Post an embarrassing photo of yourself.', 'Let someone write a message to send from your account.', 'Talk without closing your mouth for 1 minute.', 'Act like a chicken for 30 seconds.', 'Call a random contact and sing happy birthday.',
];

export default new Command({
  name: 'dare',
  description: 'Get a dare challenge',
  category: 'social',
  type: 'both',
  async execute(client, interaction) {
    const q = dares[Math.floor(Math.random() * dares.length)];
    if (interaction.isChatInputCommand?.() ?? false) await interaction.reply({ content: `😈 ${q}` });
    else await (interaction as any).reply(`😈 ${q}`);
  },
});
