import { Command } from '../../structures/Command';
import { AFKModel } from '../../models';

export default new Command({
  name: 'afk',
  description: 'Set your AFK status',
  category: 'utility',
  type: 'both',
  options: [
    { name: 'reason', description: 'The reason for being AFK', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) {
      const msg = 'This command can only be used in a server.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    let reason = 'AFK';
    if (isSlash) {
      reason = interaction.options.getString('reason') ?? 'AFK';
    } else {
      const args = (interaction as any).args as string[];
      if (args && args.length > 0) {
        reason = args.join(' ');
      }
    }

    await AFKModel.findOneAndUpdate(
      { userId: interaction.author ? interaction.author.id : interaction.user.id, guildId: guild.id },
      {
        userId: interaction.author ? interaction.author.id : interaction.user.id,
        guildId: guild.id,
        reason,
        since: new Date(),
      },
      { upsert: true },
    );

    const msg = `<@${interaction.user ? interaction.user.id : (interaction as any).author.id}> I set your AFK as: ${reason}`;
    if (isSlash) {
      await interaction.reply({ content: msg });
    } else {
      await (interaction as any).reply(msg);
    }
  },
});
