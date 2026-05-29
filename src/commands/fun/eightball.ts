import { Command } from '../../structures/Command';

const responses = ['It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.', 'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.', "Don't count on it.", 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'];

export default new Command({
  name: '8ball',
  description: 'Ask the magic 8-ball a question',
  category: 'fun',
  type: 'both',
  options: [
    { name: 'question', description: 'Your question', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let question: string;
    if (isSlash) question = interaction.options.getString('question', true);
    else {
      const args = (interaction as any).args as string[];
      question = args?.join(' ') ?? '';
    }
    const answer = responses[Math.floor(Math.random() * responses.length)]!;
    const msg = `🎱 **Question:** ${question}\n**Answer:** ${answer}`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
