import {
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  PermissionFlagsBits,
  ChannelType,
  OverwriteType,
} from 'discord.js';
import { AxionClient } from '../structures/AxionClient';
import { TicketModel, GuildModel } from '../models';
import { EMBED_COLORS } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class TicketManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async createTicket(
    guildId: string,
    userId: string,
    category: string = 'general',
  ): Promise<{ channelId: string; ticketId: string }> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) throw new Error('Guild not found');

    const guildConfig = await GuildModel.findOne({ guildId });
    const ticketId = crypto.randomBytes(4).toString('hex');

    const member = await guild.members.fetch(userId);
    const ticketName = `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${ticketId.slice(0, 4)}`;

    const categoryChannel = guildConfig?.ticketCategory
      ? (guild.channels.cache.get(guildConfig.ticketCategory) as CategoryChannel)
      : undefined;

    const channel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: categoryChannel?.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
          type: OverwriteType.Role,
        },
        {
          id: userId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          type: OverwriteType.Member,
        },
        {
          id: guildConfig?.ticketStaffRole ?? guild.roles.everyone.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          type: OverwriteType.Role,
        },
      ],
    });

    await TicketModel.create({
      ticketId,
      guildId,
      channelId: channel.id,
      userId,
      category,
      status: 'open',
      messages: [],
    });

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(`Ticket #${ticketId.slice(0, 8)}`)
      .setDescription(`Welcome <@${userId}>!\nPlease describe your issue and staff will be with you shortly.`)
      .addFields(
        { name: 'Category', value: category, inline: true },
        { name: 'Status', value: 'Open', inline: true },
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim_${ticketId}`).setLabel('Claim').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`ticket_close_${ticketId}`).setLabel('Close').setStyle(ButtonStyle.Danger),
    );

    await channel.send({ content: `<@${userId}>`, embeds: [embed], components: [row] });

    return { channelId: channel.id, ticketId };
  }

  public async claimTicket(ticketId: string, staffId: string): Promise<void> {
    const ticket = await TicketModel.findOne({ ticketId });
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status !== 'open') throw new Error('Ticket is not open');

    ticket.status = 'claimed';
    ticket.claimedBy = staffId;
    await ticket.save();

    const channel = this.client.channels.cache.get(ticket.channelId) as TextChannel;
    if (channel) {
      await channel.send({ content: `<@${staffId}> has claimed this ticket.` });
    }
  }

  public async closeTicket(ticketId: string): Promise<string> {
    const ticket = await TicketModel.findOne({ ticketId });
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status === 'closed') throw new Error('Ticket already closed');

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    const channel = this.client.channels.cache.get(ticket.channelId) as TextChannel;

    if (channel) {
      const transcript = await this.generateTranscript(ticket);
      await channel.send('Ticket closed. Deleting channel in 5 seconds...');

      const guildConfig = await GuildModel.findOne({ guildId: ticket.guildId });
      if (guildConfig?.ticketLogChannel) {
        const logChannel = this.client.channels.cache.get(guildConfig.ticketLogChannel) as TextChannel;
        if (logChannel) {
          const transcriptEmbed = new EmbedBuilder()
            .setColor(EMBED_COLORS.warning)
            .setTitle(`Ticket Closed: #${ticketId.slice(0, 8)}`)
            .addFields(
              { name: 'User', value: `<@${ticket.userId}>`, inline: true },
              { name: 'Closed By', value: `<@${ticket.claimedBy}>`, inline: true },
              { name: 'Messages', value: String(ticket.messages.length), inline: true },
            )
            .setTimestamp();

          await logChannel.send({
            embeds: [transcriptEmbed],
            files: [{ attachment: Buffer.from(transcript), name: `ticket-${ticketId}.html` }],
          });
        }
      }

      setTimeout(async () => {
        try {
          await channel.delete();
        } catch {
          // Channel may already be deleted
        }
      }, 5000);
    }

    return ticketId;
  }

  public async addMessage(
    ticketId: string,
    authorId: string,
    authorTag: string,
    content: string,
    attachments: string[] = [],
  ): Promise<void> {
    await TicketModel.updateOne(
      { ticketId },
      {
        $push: {
          messages: {
            authorId,
            authorTag,
            content,
            timestamp: new Date(),
            attachments,
          },
        },
      },
    );
  }

  private async generateTranscript(ticket: Record<string, any>): Promise<string> {
    let html = `<!DOCTYPE html>
<html>
<head><title>Ticket Transcript - ${ticket.ticketId}</title>
<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
h1 { color: #5865F2; }
.message { margin: 10px 0; padding: 10px; border-radius: 5px; background: #f0f0f0; }
.author { font-weight: bold; color: #5865F2; }
.time { color: #999; font-size: 0.8em; }
</style></head>
<body>
<h1>Ticket #${ticket.ticketId}</h1>
<p>User: ${ticket.userId} | Status: ${ticket.status}</p>
<hr>`;

    for (const msg of ticket.messages) {
      html += `<div class="message">
<span class="author">${msg.authorTag}</span>
<span class="time">${new Date(msg.timestamp).toLocaleString()}</span>
<p>${msg.content}</p>
${msg.attachments.map((a: string) => `<a href="${a}">Attachment</a>`).join(' ')}
</div>`;
    }

    html += '</body></html>';
    return html;
  }
}
