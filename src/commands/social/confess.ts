import { Command } from '../../structures/Command';

export default new Command({
  name: 'confess',
  description: 'Send an anonymous confession',
  category: 'social',
  type: 'both',
  options: [
    { name: 'message', description: 'Your confession', type: 'string', required: true },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    let message: string;
    if (isSlash) message = interaction.options.getString('message', true);
    else {
      const args = (interaction as any).args as string[];
      message = args?.join(' ') ?? '';
    }

    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      const { EmbedBuilder } = await import('discord.js');
      const { EMBED_COLORS } = await import('../../constants');
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.primary)
        .setTitle('Anonymous Confession')
        .setDescription(message)
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }

    if (isSlash) await interaction.reply({ content: '✅ Your confession has been sent.', ephemeral: true });
    else await (interaction as any).reply('✅ Your confession has been sent.');
  },
});
