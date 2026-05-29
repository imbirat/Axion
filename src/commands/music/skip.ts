import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';

export default new Command({
  name: 'skip',
  description: 'Skip the current track',
  category: 'music',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    try {
      await client.music.skip(guild.id);
      const msg = '⏭ Skipped.';
      if (isSlash) await interaction.reply({ content: msg });
      else await (interaction as any).reply(msg);
    } catch (error: any) {
      const msg = error.message || 'Failed to skip.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
    }
  },
});
