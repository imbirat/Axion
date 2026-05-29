import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';
import { ECONOMY_CONFIG } from '../../constants';

export default new Command({
  name: 'work',
  description: 'Work to earn coins',
  category: 'economy',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    const eco = await EconomyModel.findOne({ userId, guildId: guild.id });

    if (eco?.lastWork) {
      const diff = Date.now() - eco.lastWork.getTime();
      if (diff < 3600000) {
        const remaining = 3600000 - diff;
        const mins = Math.floor(remaining / 60000);
        const msg = `⏰ You need to rest! Come back in ${mins}m.`;
        if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
        else await (interaction as any).reply(msg);
        return;
      }
    }

    const earned = Math.floor(Math.random() * (ECONOMY_CONFIG.workMax - ECONOMY_CONFIG.workMin) + ECONOMY_CONFIG.workMin);
    const jobs = ['developer', 'chef', 'designer', 'writer', 'musician', 'builder', 'farmer', 'teacher', 'driver', 'pilot'];
    const job = jobs[Math.floor(Math.random() * jobs.length)]!;

    await EconomyModel.findOneAndUpdate(
      { userId, guildId: guild.id },
      { $inc: { wallet: earned, totalEarned: earned }, $set: { lastWork: new Date() } },
      { upsert: true },
    );

    const msg = `💼 You worked as a **${job}** and earned **${earned}** coins!`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
