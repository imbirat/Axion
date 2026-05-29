import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';

export default new Command({
  name: 'sticky',
  description: 'Manage sticky messages',
  category: 'sticky',
  permissions: [PermissionFlagsBits.ManageMessages],
  type: 'both',
  options: [
    { name: 'action', description: 'set or remove', type: 'string', required: true, choices: [{ name: 'set', value: 'set' }, { name: 'remove', value: 'remove' }] },
    { name: 'content', description: 'Message content (for set)', type: 'string', required: false },
    { name: 'embed', description: 'Render as embed?', type: 'boolean', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let action: string;
    if (isSlash) {
      action = interaction.options.getString('action', true);
    } else {
      const args = (interaction as any).args as string[];
      action = args?.[0] ?? 'set';
    }

    if (action === 'set') {
      let content: string, isEmbed = false;
      if (isSlash) {
        content = interaction.options.getString('content', true);
        isEmbed = interaction.options.getBoolean('embed') ?? false;
      } else {
        const args = (interaction as any).args as string[];
        isEmbed = args?.[1] === 'true';
        content = args?.slice(2).join(' ') ?? 'Sticky message';
      }

      await client.sticky.setSticky({
        channelId: interaction.channelId,
        guildId: guild.id,
        content,
        isEmbed,
      });
      await interaction.reply({ content: '✅ Sticky message set!' });
    } else {
      await client.sticky.removeSticky(interaction.channelId);
      await interaction.reply({ content: '✅ Sticky message removed.' });
    }
  },
});
