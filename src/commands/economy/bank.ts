import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';

export default new Command({
  name: 'bank',
  description: 'Withdraw coins from your bank',
  category: 'economy',
  type: 'both',
  options: [
    { name: 'amount', description: 'Amount to withdraw (or "all")', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    let amountStr: string;
    if (isSlash) amountStr = interaction.options.getString('amount', true);
    else {
      const args = (interaction as any).args as string[];
      amountStr = args?.[0] ?? '0';
    }

    const eco = await EconomyModel.findOne({ userId, guildId: guild.id });
    if (!eco) { await interaction.reply({ content: 'You have no bank account yet.', ephemeral: true }); return; }

    const amount = amountStr.toLowerCase() === 'all' ? eco.bank : parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) { await interaction.reply({ content: 'Invalid amount.', ephemeral: true }); return; }
    if (amount > eco.bank) { await interaction.reply({ content: 'Not enough coins in bank.', ephemeral: true }); return; }

    await EconomyModel.findOneAndUpdate(
      { userId, guildId: guild.id },
      { $inc: { wallet: amount, bank: -amount } },
    );

    const msg = `🏦 Withdrew **${amount}** coins from your bank.`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
