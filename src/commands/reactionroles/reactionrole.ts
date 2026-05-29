import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EMBED_COLORS } from '../../constants';

export default new Command({
  name: 'reactionrole',
  description: 'Create a reaction role panel',
  category: 'reactionroles',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'title', description: 'Panel title', type: 'string', required: true },
    { name: 'description', description: 'Panel description', type: 'string', required: true },
    { name: 'role1', description: 'First role', type: 'role', required: true },
    { name: 'label1', description: 'First button label', type: 'string', required: true },
    { name: 'role2', description: 'Second role', type: 'role', required: false },
    { name: 'label2', description: 'Second button label', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    if (!isSlash) { await (interaction as any).reply('Use the slash command version.'); return; }

    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const role1 = interaction.options.getRole('role1', true);
    const label1 = interaction.options.getString('label1', true);
    const role2 = interaction.options.getRole('role2');
    const label2 = interaction.options.getString('label2');

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(title)
      .setDescription(description);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`rr_${role1.id}`)
        .setLabel(label1)
        .setStyle(ButtonStyle.Primary),
    );

    if (role2 && label2) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`rr_${role2.id}`)
          .setLabel(label2)
          .setStyle(ButtonStyle.Primary),
      );
    }

    await interaction.channel?.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Reaction role panel created!', ephemeral: true });
  },
});
