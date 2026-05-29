import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';
import { ECONOMY_CONFIG } from '../../constants';

export default new Command({
  name: 'fish',
  description: 'Go fishing to earn coins',
  category: 'economy',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    const eco = await EconomyModel.findOne({ userId, guildId: guild.id });

    if (eco?.lastFish) {
      const diff = Date.now() - eco.lastFish.getTime();
      if (diff < 300000) {
        const remaining = 300000 - diff;
        const mins = Math.ceil(remaining / 60000);
        const msg = `⏰ You need to wait ${mins}m before fishing again.`;
        if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
        else await (interaction as any).reply(msg);
        return;
      }
    }

    const earned = Math.floor(Math.random() * (ECONOMY_CONFIG.fishMax - ECONOMY_CONFIG.fishMin) + ECONOMY_CONFIG.fishMin);
    const fishTypes = ['🐟 Salmon', '🐠 Tropical Fish', '🐡 Pufferfish', '🦈 Shark', '🐙 Octopus', '🦐 Shrimp', '🐋 Whale', '🐊 Alligator'];
    const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)]!;

    await EconomyModel.findOneAndUpdate(
      { userId, guildId: guild.id },
      { $inc: { wallet: earned, totalEarned: earned }, $set: { lastFish: new Date() } },
      { upsert: true },
    );

    const msg = `🎣 You caught a ${fish} and earned **${earned}** coins!`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
