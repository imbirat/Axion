import { Event } from '../../structures/Event';
import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  GuildMember,
  TextChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';
import { GuildModel } from '../../models';
import { EMBED_COLORS, HELP_CATEGORIES, INVITE_LINK, SUPPORT_SERVER, OWNER_ID, SLASH_PREFIX } from '../../constants';
import { Command } from '../../structures/Command';

export default new Event({
  name: 'interactionCreate',
  async execute(interaction: any) {
    const client = interaction.client as AxionClient;

    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isButton()) {
      await handleButton(client, interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(client, interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(client, interaction);
    }
  },
});

async function handleSlashCommand(client: AxionClient, interaction: ChatInputCommandInteraction): Promise<void> {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: 'Command not found.', ephemeral: true });
    return;
  }

  if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
    await interaction.reply({ content: 'This command is owner-only.', ephemeral: true });
    return;
  }

  if (command.guildOnly && !interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in servers.', ephemeral: true });
    return;
  }

  if (command.permissions.length > 0 && interaction.guild) {
    const member = interaction.member as GuildMember;
    const hasPerms = command.permissions.every((perm) => member.permissions.has(perm));
    if (!hasPerms) {
      await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }
  }

  client.metrics.recordCommand(command.name);

  try {
    await command.execute(client, interaction);
  } catch (error) {
    client.logger.error(`Error executing command ${command.name}:`, error);
    const errorMessage = 'An error occurred while executing this command.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}

async function handleButton(client: AxionClient, interaction: ButtonInteraction): Promise<void> {
  const { customId } = interaction;

  if (customId === 'help_close') {
    await interaction.deleteReply();
    return;
  }

  if (customId.startsWith('help_')) {
    await handleHelpButtons(client, interaction);
    return;
  }

  if (customId.startsWith('player_')) {
    await handlePlayerButtons(client, interaction);
    return;
  }

  if (customId.startsWith('giveaway_')) {
    await handleGiveawayButton(client, interaction);
    return;
  }

  if (customId.startsWith('ticket_')) {
    await handleTicketButton(client, interaction);
    return;
  }

  if (customId.startsWith('poll_vote_')) {
    if (!interaction.guild) return;
    const pollIndex = parseInt(customId.split('_')[2]!, 10);
    try {
      await client.poll.vote(interaction.message.id, interaction.user.id, pollIndex);
      await interaction.reply({ content: 'Vote recorded!', ephemeral: true });
    } catch (error: any) {
      await interaction.reply({ content: error.message, ephemeral: true });
    }
    return;
  }

  if (customId.startsWith('rr_') || customId.startsWith('br_')) {
    if (!interaction.guild) return;
    const roleId = customId.split('_')[1]!;
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) { await interaction.reply({ content: 'Role not found.', ephemeral: true }); return; }
    const member = interaction.member as GuildMember;
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      await interaction.reply({ content: `Removed ${role}`, ephemeral: true });
    } else {
      await member.roles.add(roleId);
      await interaction.reply({ content: `Added ${role}`, ephemeral: true });
    }
    return;
  }

  if (customId === 'verify_me') {
    if (!interaction.guild) return;
    const { GuildModel } = await import('../../models');
    const guildConfig = await GuildModel.findOne({ guildId: interaction.guild.id });
    const verifiedRoleId = guildConfig?.verificationConfig?.verifiedRole;
    if (!verifiedRoleId) { await interaction.reply({ content: 'Verification is not configured.', ephemeral: true }); return; }
    const member = interaction.member as GuildMember;
    await member.roles.add(verifiedRoleId);
    await interaction.reply({ content: '✅ You have been verified!', ephemeral: true });
    return;
  }

  const component = client.components.get(customId);
  if (component) {
    await component.execute(interaction);
  }
}

async function handleSelectMenu(client: AxionClient, interaction: StringSelectMenuInteraction): Promise<void> {
  if (interaction.customId === 'help_category_select') {
    await handleHelpCategorySelect(client, interaction);
    return;
  }

  const component = client.components.get(interaction.customId);
  if (component) {
    await component.execute(interaction);
  }
}

async function handleModal(client: AxionClient, interaction: ModalSubmitInteraction): Promise<void> {
  const component = client.components.get(interaction.customId);
  if (component) {
    await component.execute(interaction);
  }
}

async function handleHelpButtons(client: AxionClient, interaction: ButtonInteraction): Promise<void> {
  if (interaction.user.id !== interaction.message.interaction?.user?.id) {
    await interaction.reply({ content: '❌ This menu is not for you.', ephemeral: true });
    return;
  }

  const embedData = interaction.message.embeds[0];
  const rawTitle = embedData?.title ?? '';
  const currentCategoryMatch = rawTitle.match(/^(\S+)\s+(.+)\sCommands$/);
  const currentCategoryName = currentCategoryMatch?.[2]?.trim();
  const currentCategoryIndex = HELP_CATEGORIES.findIndex((c) => c.name === currentCategoryName);
  const categoryIndex = currentCategoryIndex >= 0 ? currentCategoryIndex : 0;

  const action = interaction.customId.replace('help_', '');

  if (action === 'close') {
    await interaction.deleteReply();
    return;
  }

  let newIndex = categoryIndex;

  switch (action) {
    case 'first':
      newIndex = 0;
      break;
    case 'prev':
      newIndex = Math.max(0, categoryIndex - 1);
      break;
    case 'next':
      newIndex = Math.min(HELP_CATEGORIES.length - 1, categoryIndex + 1);
      break;
    case 'last':
      newIndex = HELP_CATEGORIES.length - 1;
      break;
    default:
      return;
  }

  await sendHelpCategoryPage(client, interaction, newIndex);
}

async function handleHelpCategorySelect(client: AxionClient, interaction: StringSelectMenuInteraction): Promise<void> {
  if (interaction.user.id !== interaction.message.interaction?.user?.id) {
    await interaction.reply({ content: '❌ This menu is not for you.', ephemeral: true });
    return;
  }

  const value = interaction.values[0];
  if (!value) return;

  const categoryIndex = HELP_CATEGORIES.findIndex((c) => c.name === value);
  if (categoryIndex < 0) return;

  await sendHelpCategoryPage(client, interaction, categoryIndex);
}

async function sendHelpCategoryPage(
  client: AxionClient,
  interaction: ButtonInteraction | StringSelectMenuInteraction,
  categoryIndex: number,
): Promise<void> {
  const category = HELP_CATEGORIES[categoryIndex];
  if (!category) return;

  const categoryCommands = Array.from(client.commands.values())
    .filter((cmd) => cmd.category === category.name.toLowerCase().replace(/[^a-z]/g, ''));

  const categoryEmoji = category.emoji;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.primary)
    .setTitle(`${categoryEmoji} ${category.name} Commands`);

  if (categoryCommands.length > 0) {
    const desc = categoryCommands
      .map((cmd) => `\`/${cmd.name}\` — ${cmd.description}`)
      .join('\n');
    embed.setDescription(desc);
  } else {
    embed.setDescription('No commands in this category.');
  }

  embed.setFooter({ text: `Page ${categoryIndex + 1} / ${HELP_CATEGORIES.length}` });

  const isFirstCategory = categoryIndex === 0;
  const isLastCategory = categoryIndex === HELP_CATEGORIES.length - 1;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('help_first')
      .setEmoji('⏮')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isFirstCategory),
    new ButtonBuilder()
      .setCustomId('help_prev')
      .setEmoji('◀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isFirstCategory),
    new ButtonBuilder()
      .setCustomId('help_next')
      .setEmoji('▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isLastCategory),
    new ButtonBuilder()
      .setCustomId('help_last')
      .setEmoji('⏭')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isLastCategory),
    new ButtonBuilder()
      .setCustomId('help_close')
      .setEmoji('🔴')
      .setStyle(ButtonStyle.Danger),
  );

  await interaction.update({ embeds: [embed], components: [row] });

  setTimeout(async () => {
    try {
      const msg = await interaction.message.fetch().catch(() => null);
      if (msg && msg.editable) {
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('help_first_disabled')
            .setEmoji('⏮')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_prev_disabled')
            .setEmoji('◀')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_next_disabled')
            .setEmoji('▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_last_disabled')
            .setEmoji('⏭')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_close_disabled')
            .setEmoji('🔴')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );
        await msg.edit({ components: [disabledRow] }).catch(() => {});
      }
    } catch {}
  }, 120000);
}

async function handlePlayerButtons(client: AxionClient, interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.split('_');
  const action = parts[1];
  const guildId = parts.slice(2).join('_');

  if (!guildId || !interaction.guild || interaction.guild.id !== guildId) return;

  const player = client.music.getPlayer(guildId);
  if (!player) {
    await interaction.reply({ content: 'No active player.', ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  if (!member.voice.channel || member.voice.channel.id !== player.voiceId) {
    await interaction.reply({ content: 'You must be in the same voice channel.', ephemeral: true });
    return;
  }

  switch (action) {
    case 'skip': {
      await player.skip();
      await interaction.reply({ content: '⏭ Skipped.', ephemeral: true });
      break;
    }
    case 'pause': {
      const paused = player.paused;
      await player.pause(!paused);
      await interaction.reply({ content: paused ? '▶ Resumed.' : '⏸ Paused.', ephemeral: true });
      break;
    }
    case 'loop': {
      if (player.loop === 'none') {
        await player.setLoop('track');
        await interaction.reply({ content: '🔂 Loop track.', ephemeral: true });
      } else if (player.loop === 'track') {
        await player.setLoop('queue');
        await interaction.reply({ content: '🔁 Loop queue.', ephemeral: true });
      } else {
        await player.setLoop('none');
        await interaction.reply({ content: '➡ Loop off.', ephemeral: true });
      }
      break;
    }
    case 'volup': {
      const newVol = Math.min(player.volume + 10, 150);
      await player.setVolume(newVol);
      await interaction.reply({ content: `🔊 Volume: ${newVol}%`, ephemeral: true });
      break;
    }
    case 'stop': {
      player.queue.clear();
      await player.stop();
      player.destroy();
      client.music.removePlayer(guildId);
      await interaction.reply({ content: '⏹ Stopped.', ephemeral: true });
      break;
    }
  }
}

async function handleGiveawayButton(client: AxionClient, interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild) return;

  const { GiveawayModel } = await import('../../models');
  const giveaway = await GiveawayModel.findOne({ messageId: interaction.message.id });
  if (!giveaway || giveaway.ended) {
    await interaction.reply({ content: 'This giveaway has ended.', ephemeral: true });
    return;
  }

  if (giveaway.entrants.includes(interaction.user.id)) {
    await interaction.reply({ content: 'You already entered!', ephemeral: true });
    return;
  }

  await GiveawayModel.updateOne(
    { messageId: interaction.message.id },
    { $push: { entrants: interaction.user.id } },
  );

  await interaction.reply({ content: '🎉 You entered the giveaway!', ephemeral: true });
}

async function handleTicketButton(client: AxionClient, interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.split('_');
  const action = parts[1];
  const ticketId = parts.slice(2).join('_');

  if (!ticketId || !interaction.guild) return;

  try {
    switch (action) {
      case 'claim': {
        await client.ticket.claimTicket(ticketId, interaction.user.id);
        await interaction.reply({ content: 'Ticket claimed.', ephemeral: true });
        break;
      }
      case 'close': {
        await client.ticket.closeTicket(ticketId);
        await interaction.reply({ content: 'Ticket closed.', ephemeral: true });
        break;
      }
      default: {
        await interaction.reply({ content: 'Unknown action.', ephemeral: true });
      }
    }
  } catch (error: any) {
    await interaction.reply({ content: error.message, ephemeral: true });
  }
}
