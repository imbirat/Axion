import { Command } from '../../structures/Command';
import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EMBED_COLORS } from '../../constants';
import { GuildModel } from '../../models';

export default new Command({
  name: 'verify',
  description: 'Set up the verification panel',
  category: 'verification',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.verification)
      .setTitle('Verification')
      .setDescription('Click the button below to verify yourself and gain access to the server.')
      .setFooter({ text: 'Axion Verification System' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_me')
        .setLabel('✅ Verify')
        .setStyle(ButtonStyle.Success),
    );

    await interaction.channel?.send({ embeds: [embed], components: [row] });

    const msg = '✅ Verification panel created!';
    if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
    else await (interaction as any).reply(msg);
  },
});
