import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';
import { ECONOMY_CONFIG } from '../../constants';

export default new Command({
  name: 'daily',
  description: 'Claim your daily reward',
  category: 'economy',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    const eco = await EconomyModel.findOne({ userId, guildId: guild.id });

    if (eco?.lastDaily) {
      const diff = Date.now() - eco.lastDaily.getTime();
      if (diff < 86400000) {
        const remaining = 86400000 - diff;
        const hours = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        const msg = `⏰ You already claimed your daily! Come back in ${hours}h ${mins}m.`;
        if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
        else await (interaction as any).reply(msg);
        return;
      }
    }

    await EconomyModel.findOneAndUpdate(
      { userId, guildId: guild.id },
      {
        $inc: { wallet: ECONOMY_CONFIG.dailyAmount, totalEarned: ECONOMY_CONFIG.dailyAmount },
        $set: { lastDaily: new Date() },
      },
      { upsert: true },
    );

    const msg = `💰 You claimed your daily **${ECONOMY_CONFIG.dailyAmount}** coins!`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
