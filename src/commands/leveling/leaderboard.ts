import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { XPModel, EconomyModel } from '../../models';

export default new Command({
  name: 'leaderboard',
  description: 'View server leaderboards',
  category: 'leveling',
  type: 'both',
  options: [
    { name: 'type', description: 'Leaderboard type', type: 'string', required: true, choices: [{ name: 'XP', value: 'xp' }, { name: 'Economy', value: 'economy' }] },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let type = 'xp';
    if (isSlash) {
      type = interaction.options.getString('type', true);
    } else {
      const args = (interaction as any).args as string[];
      type = args?.[0] ?? 'xp';
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(type === 'xp' ? '🏆 XP Leaderboard' : '💰 Economy Leaderboard');

    if (type === 'xp') {
      const top = await XPModel.find({ guildId: guild.id }).sort({ xp: -1 }).limit(10);
      if (top.length === 0) {
        embed.setDescription('No XP data yet.');
      } else {
        const desc = await Promise.all(top.map(async (entry, i) => {
          const user = await client.users.fetch(entry.userId).catch(() => null);
          return `${i + 1}. ${user?.tag ?? 'Unknown'} — Level ${entry.level} (${entry.xp} XP)`;
        }));
        embed.setDescription(desc.join('\n'));
      }
    } else {
      const top = await EconomyModel.find({ guildId: guild.id }).sort({ wallet: -1 }).limit(10);
      if (top.length === 0) {
        embed.setDescription('No economy data yet.');
      } else {
        const desc = await Promise.all(top.map(async (entry, i) => {
          const user = await client.users.fetch(entry.userId).catch(() => null);
          return `${i + 1}. ${user?.tag ?? 'Unknown'} — 💰 ${entry.wallet + entry.bank}`;
        }));
        embed.setDescription(desc.join('\n'));
      }
    }

    if (isSlash) await interaction.reply({ embeds: [embed] });
    else await (interaction as any).reply({ embeds: [embed] });
  },
});
