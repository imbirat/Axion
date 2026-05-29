import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';

export default new Command({
  name: 'give',
  description: 'Give coins to another user',
  category: 'economy',
  type: 'both',
  options: [
    { name: 'user', description: 'The user to give coins to', type: 'user', required: true },
    { name: 'amount', description: 'Amount of coins', type: 'integer', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    let target, amount: number;
    if (isSlash) {
      target = interaction.options.getUser('user', true);
      amount = interaction.options.getInteger('amount', true);
    } else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await client.users.fetch(id).catch(() => null) : null;
      amount = parseInt(args?.[1] ?? '0', 10);
    }
    if (!target || target.id === userId) { await interaction.reply({ content: 'Invalid target.', ephemeral: true }); return; }
    if (amount <= 0) { await interaction.reply({ content: 'Amount must be positive.', ephemeral: true }); return; }

    const senderEco = await EconomyModel.findOne({ userId, guildId: guild.id });
    if (!senderEco || senderEco.wallet < amount) { await interaction.reply({ content: 'Not enough coins.', ephemeral: true }); return; }

    await EconomyModel.findOneAndUpdate({ userId, guildId: guild.id }, { $inc: { wallet: -amount } });
    await EconomyModel.findOneAndUpdate({ userId: target.id, guildId: guild.id }, { $inc: { wallet: amount } }, { upsert: true });

    const msg = `💸 You gave **${amount}** coins to ${target.tag}.`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
