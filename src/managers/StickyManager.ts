import { TextChannel, EmbedBuilder } from 'discord.js';
import { AxionClient } from '../structures/AxionClient';
import { StickyMessageModel } from '../models';

export class StickyManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async init(): Promise<void> {
    this.client.logger.info('Sticky message manager initialized');
  }

  public async handleMessage(channelId: string, guildId: string): Promise<void> {
    const sticky = await StickyMessageModel.findOne({ channelId, guildId });
    if (!sticky) return;

    const channel = this.client.channels.cache.get(channelId) as TextChannel;
    if (!channel) return;

    try {
      if (sticky.lastMessageId) {
        const lastMsg = await channel.messages.fetch(sticky.lastMessageId).catch(() => null);
        if (lastMsg) {
          await lastMsg.delete().catch(() => {});
        }
      }

      let sent: any;
      if (sticky.isEmbed) {
        const embed = new EmbedBuilder()
          .setTitle(sticky.embedTitle || 'Sticky Message')
          .setDescription(sticky.content)
          .setColor(parseInt(sticky.embedColor.replace('#', ''), 16) || 0x5865f2);

        sent = await channel.send({ embeds: [embed] });
      } else {
        sent = await channel.send(sticky.content);
      }

      sticky.lastMessageId = sent.id;
      await sticky.save();
    } catch {
      // Channel may not exist or missing permissions
    }
  }

  public async setSticky(options: {
    channelId: string;
    guildId: string;
    content: string;
    isEmbed: boolean;
    embedTitle?: string;
    embedColor?: string;
  }): Promise<void> {
    await StickyMessageModel.findOneAndUpdate(
      { channelId: options.channelId },
      {
        channelId: options.channelId,
        guildId: options.guildId,
        content: options.content,
        isEmbed: options.isEmbed,
        embedTitle: options.embedTitle ?? '',
        embedColor: options.embedColor ?? '#5865F2',
        lastMessageId: null,
      },
      { upsert: true },
    );
  }

  public async removeSticky(channelId: string): Promise<void> {
    const sticky = await StickyMessageModel.findOneAndDelete({ channelId });
    if (sticky?.lastMessageId) {
      const channel = this.client.channels.cache.get(channelId) as TextChannel;
      if (channel) {
        const msg = await channel.messages.fetch(sticky.lastMessageId).catch(() => null);
        if (msg) await msg.delete().catch(() => {});
      }
    }
  }

  public async getSticky(channelId: string) {
    return StickyMessageModel.findOne({ channelId });
  }
}
