import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS, LEVEL_FORMULA } from '../../constants';
import { XPModel, EconomyModel } from '../../models';

export default new Command({
  name: 'profile',
  description: 'View your or another user\'s profile',
  category: 'leveling',
  type: 'both',
  options: [
    { name: 'type', description: 'Profile type', type: 'string', required: true, choices: [{ name: 'XP', value: 'xp' }, { name: 'Economy', value: 'economy' }] },
    { name: 'user', description: 'The user', type: 'user', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let type = 'xp', target = interaction.user;
    if (isSlash) {
      type = interaction.options.getString('type', true);
      target = interaction.options.getUser('user') ?? interaction.user;
    } else {
      const args = (interaction as any).args as string[];
      type = args?.[0] ?? 'xp';
      const mention = args?.[1]?.replace(/[<@!>]/g, '');
      if (mention) target = await client.users.fetch(mention).catch(() => interaction.user);
    }

    if (type === 'xp') {
      const xpData = await XPModel.findOne({ userId: target.id, guildId: guild.id });
      const level = xpData?.level ?? 0;
      const currentXp = xpData?.xp ?? 0;
      const needed = LEVEL_FORMULA(level);
      const totalXp = xpData?.totalXp ?? 0;
      const prestige = xpData?.prestige ?? 0;
      const progress = needed > 0 ? Math.min((currentXp / needed) * 100, 100) : 0;
      const bar = '█'.repeat(Math.round(progress / 10)) + '░'.repeat(10 - Math.round(progress / 10));

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.leveling)
        .setTitle(`${target.tag}'s XP Profile`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Level', value: String(level), inline: true },
          { name: 'XP', value: `${currentXp} / ${needed}`, inline: true },
          { name: 'Total XP', value: String(totalXp), inline: true },
          { name: 'Prestige', value: String(prestige), inline: true },
          { name: 'Progress', value: `${bar} ${progress.toFixed(1)}%`, inline: false },
        );

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } else {
      const ecoData = await EconomyModel.findOne({ userId: target.id, guildId: guild.id });
      const wallet = ecoData?.wallet ?? 0;
      const bank = ecoData?.bank ?? 0;
      const total = wallet + bank;
      const bankCap = ecoData?.bankCapacity ?? 100000;

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.economy)
        .setTitle(`${target.tag}'s Economy Profile`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Wallet', value: `💰 ${wallet}`, inline: true },
          { name: 'Bank', value: `🏦 ${bank} / ${bankCap}`, inline: true },
          { name: 'Total', value: `💎 ${total}`, inline: true },
        );

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    }
  },
});
