import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';

export default new Command({
  name: 'deposit',
  description: 'Deposit coins into your bank',
  category: 'economy',
  type: 'both',
  options: [
    { name: 'amount', description: 'Amount to deposit (or "all")', type: 'string', required: true },
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

    const eco = await EconomyModel.findOne({ userId, guildId: guild.id }) ?? { wallet: 0, bank: 0, bankCapacity: 100000 };

    const amount = amountStr.toLowerCase() === 'all' ? eco.wallet : parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) { await interaction.reply({ content: 'Invalid amount.', ephemeral: true }); return; }
    if (amount > eco.wallet) { await interaction.reply({ content: 'You do not have enough coins.', ephemeral: true }); return; }
    if (eco.bank + amount > eco.bankCapacity) { await interaction.reply({ content: 'Bank is full! Upgrade capacity or withdraw first.', ephemeral: true }); return; }

    await EconomyModel.findOneAndUpdate(
      { userId, guildId: guild.id },
      { $inc: { wallet: -amount, bank: amount } },
      { upsert: true },
    );

    const msg = `🏦 Deposited **${amount}** coins into your bank.`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
