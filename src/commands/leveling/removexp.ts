import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { XPModel } from '../../models';

export default new Command({
  name: 'removexp',
  description: 'Remove XP from a user (admin)',
  category: 'leveling',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'user', description: 'The user', type: 'user', required: true },
    { name: 'amount', description: 'XP amount', type: 'integer', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

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
    if (!target) { await interaction.reply({ content: 'Invalid user.', ephemeral: true }); return; }

    await XPModel.findOneAndUpdate(
      { userId: target.id, guildId: guild.id },
      { $inc: { xp: -amount, totalXp: -amount, weeklyXp: -amount } },
    );

    const msg = `Removed ${amount} XP from ${target.tag}.`;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
