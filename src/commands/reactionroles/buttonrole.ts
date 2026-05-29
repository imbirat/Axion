import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'buttonrole',
  description: 'Create a button role panel',
  category: 'reactionroles',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'title', description: 'Panel title', type: 'string', required: true },
    { name: 'description', description: 'Panel description', type: 'string', required: true },
    { name: 'role', description: 'Role to assign', type: 'role', required: true },
    { name: 'label', description: 'Button label', type: 'string', required: true },
    { name: 'emoji', description: 'Button emoji', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    if (!isSlash) { await (interaction as any).reply('Use the slash command version.'); return; }

    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const role = interaction.options.getRole('role', true);
    const label = interaction.options.getString('label', true);
    const emoji = interaction.options.getString('emoji');

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(title)
      .setDescription(description);

    const button = new ButtonBuilder()
      .setCustomId(`br_${role.id}`)
      .setLabel(label)
      .setStyle(ButtonStyle.Primary);

    if (emoji) button.setEmoji(emoji);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    await interaction.channel?.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Button role panel created!', ephemeral: true });
  },
});
