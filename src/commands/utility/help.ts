import { Command } from '../../structures/Command';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { EMBED_COLORS, HELP_CATEGORIES, INVITE_LINK, SUPPORT_SERVER } from '../../constants';
import { AxionClient } from '../../structures/AxionClient';

export default new Command({
  name: 'help',
  description: 'Shows the help menu with all commands',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary);

    const botAvatar = client.user?.displayAvatarURL() ?? '';

    embed.setAuthor({ name: 'Axion Help Menu', iconURL: botAvatar });
    embed.setDescription(
      'Do `.help | /help` to see more info about a command.\n\n' +
      '**Links**\n' +
      `[Support Server](${SUPPORT_SERVER}) | [Invite Me](${INVITE_LINK})\n\n` +
      '**Categories**\n' +
      HELP_CATEGORIES.map((c) => `${c.emoji} ${c.name}`).join('\n'),
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Make a selection')
      .addOptions(
        HELP_CATEGORIES.map((c) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(c.name)
            .setEmoji(c.emoji)
            .setValue(c.name),
        ),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const linkRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Invite')
        .setStyle(ButtonStyle.Link)
        .setURL(INVITE_LINK),
      new ButtonBuilder()
        .setLabel('Support')
        .setStyle(ButtonStyle.Link)
        .setURL(SUPPORT_SERVER),
    );

    if (isSlash) {
      await interaction.reply({ embeds: [embed], components: [row, linkRow] });
    } else {
      await (interaction as any).reply({ embeds: [embed], components: [row, linkRow] });
    }
  },
});
