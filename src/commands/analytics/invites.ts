import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'invites',
  description: 'View invite tracking stats',
  category: 'analytics',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    try {
      const invites = await guild.invites.fetch();
      const topInvites = invites
        .filter((i) => i.uses !== null && i.uses !== undefined && i.inviter)
        .sort((a, b) => (b.uses ?? 0) - (a.uses ?? 0))
        .first(10);

      if (topInvites.length === 0) {
        await interaction.reply({ content: 'No invite data available.', ephemeral: true });
        return;
      }

      const desc = topInvites.map((i) => `${i.inviter?.tag ?? 'Unknown'}: ${i.uses} invites (${i.code})`).join('\n');
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle('📨 Top Inviters')
        .setDescription(desc)
        .setTimestamp();

      if (isSlash) await interaction.reply({ embeds: [embed] });
      else await (interaction as any).reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Missing permissions to view invites.', ephemeral: true });
    }
  },
});
