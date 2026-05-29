import { Command } from '../../structures/Command';
import { AFKModel } from '../../models';

export default new Command({
  name: 'afkend',
  description: 'Remove your AFK status',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) {
      const msg = 'This command can only be used in a server.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    const result = await AFKModel.findOneAndDelete({
      userId: interaction.author ? interaction.author.id : interaction.user.id,
      guildId: guild.id,
    });

    const msg = result ? 'Your AFK status has been removed.' : 'You were not AFK.';
    if (isSlash) {
      await interaction.reply({ content: msg });
    } else {
      await (interaction as any).reply(msg);
    }
  },
});
