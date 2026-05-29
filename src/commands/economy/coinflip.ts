import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';

export default new Command({
  name: 'coinflip',
  description: 'Flip a coin and bet coins',
  category: 'economy',
  type: 'both',
  options: [
    { name: 'bet', description: 'Amount to bet', type: 'integer', required: true },
    { name: 'choice', description: 'Heads or tails', type: 'string', required: true, choices: [{ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' }] },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    let bet: number, choice: string;
    if (isSlash) {
      bet = interaction.options.getInteger('bet', true);
      choice = interaction.options.getString('choice', true);
    } else {
      const args = (interaction as any).args as string[];
      bet = parseInt(args?.[0] ?? '0', 10);
      choice = args?.[1] ?? 'heads';
    }

    if (bet < 10) { await interaction.reply({ content: 'Minimum bet is 10 coins.', ephemeral: true }); return; }

    const eco = await EconomyModel.findOne({ userId, guildId: guild.id });
    if (!eco || eco.wallet < bet) { await interaction.reply({ content: 'Not enough coins in wallet.', ephemeral: true }); return; }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === choice;

    if (won) {
      await EconomyModel.findOneAndUpdate({ userId, guildId: guild.id }, { $inc: { wallet: bet, totalEarned: bet } });
      const msg = `🎉 It's **${result}**! You won **${bet}** coins!`;
      if (isSlash) await interaction.reply({ content: msg });
      else await (interaction as any).reply(msg);
    } else {
      await EconomyModel.findOneAndUpdate({ userId, guildId: guild.id }, { $inc: { wallet: -bet } });
      const msg = `😔 It's **${result}**! You lost **${bet}** coins.`;
      if (isSlash) await interaction.reply({ content: msg });
      else await (interaction as any).reply(msg);
    }
  },
});
