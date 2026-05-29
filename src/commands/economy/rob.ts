import { Command } from '../../structures/Command';
import { EconomyModel } from '../../models';
import { ECONOMY_CONFIG } from '../../constants';

export default new Command({
  name: 'rob',
  description: 'Try to rob another user',
  category: 'economy',
  type: 'both',
  options: [
    { name: 'user', description: 'The user to rob', type: 'user', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const userId = interaction.user?.id ?? (interaction as any).author?.id;
    let target;
    if (isSlash) target = interaction.options.getUser('user', true);
    else {
      const args = (interaction as any).args as string[];
      const id = args?.[0]?.replace(/[<@!>]/g, '');
      target = id ? await client.users.fetch(id).catch(() => null) : null;
    }
    if (!target || target.id === userId) {
      await interaction.reply({ content: 'Invalid target.', ephemeral: true }); return;
    }

    const targetEco = await EconomyModel.findOne({ userId: target.id, guildId: guild.id });
    if (!targetEco || targetEco.wallet < 50) {
      await interaction.reply({ content: `${target.tag} has nothing to rob!`, ephemeral: true }); return;
    }

    const eco = await EconomyModel.findOne({ userId, guildId: guild.id });
    if (!eco || eco.wallet < 50) {
      await interaction.reply({ content: 'You need at least 50 coins in your wallet to attempt a robbery.', ephemeral: true }); return;
    }

    const failed = Math.random() < ECONOMY_CONFIG.robFailChance;
    if (failed) {
      const penalty = Math.floor(Math.random() * (ECONOMY_CONFIG.robMax - ECONOMY_CONFIG.robMin) + ECONOMY_CONFIG.robMin);
      await EconomyModel.findOneAndUpdate({ userId, guildId: guild.id }, { $inc: { wallet: -penalty } });
      const msg = `🚔 You got caught! Police fined you **${penalty}** coins.`;
      if (isSlash) await interaction.reply({ content: msg });
      else await (interaction as any).reply(msg);
    } else {
      const stolen = Math.floor(Math.random() * (ECONOMY_CONFIG.robMax - ECONOMY_CONFIG.robMin) + ECONOMY_CONFIG.robMin);
      const actualStolen = Math.min(stolen, targetEco.wallet);
      await EconomyModel.findOneAndUpdate({ userId, guildId: guild.id }, { $inc: { wallet: actualStolen } });
      await EconomyModel.findOneAndUpdate({ userId: target.id, guildId: guild.id }, { $inc: { wallet: -actualStolen } });
      const msg = `🦹 You robbed **${actualStolen}** coins from ${target.tag}!`;
      if (isSlash) await interaction.reply({ content: msg });
      else await (interaction as any).reply(msg);
    }
  },
});
