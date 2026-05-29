import { TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { AxionClient } from '../structures/AxionClient';
import { GiveawayModel } from '../models';
import { EMBED_COLORS, GIVEAWAY_CONFIG } from '../constants';
import ms from 'ms';

export class GiveawayManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async init(): Promise<void> {
    await this.resumeActiveGiveaways();
    this.client.logger.info('Giveaway manager initialized');
  }

  private async resumeActiveGiveaways(): Promise<void> {
    const activeGiveaways = await GiveawayModel.find({ ended: false });

    for (const giveaway of activeGiveaways) {
      const now = Date.now();
      const endTime = giveaway.endTime.getTime();

      if (endTime <= now) {
        await this.endGiveaway(giveaway.messageId);
      } else {
        const delay = endTime - now;
        setTimeout(() => this.endGiveaway(giveaway.messageId), delay);
      }
    }

    this.client.logger.info(`Resumed ${activeGiveaways.length} active giveaways`);
  }

  public async createGiveaway(options: {
    channelId: string;
    guildId: string;
    prize: string;
    winnerCount: number;
    duration: number;
    requiredRole: string | null;
    requiredInvites: number;
    bonusEntries: number;
  }): Promise<{ messageId: string }> {
    const channel = this.client.channels.cache.get(options.channelId) as TextChannel;
    if (!channel) throw new Error('Channel not found');

    const endTime = new Date(Date.now() + options.duration);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.giveaway)
      .setTitle('🎉 Giveaway')
      .setDescription(`**Prize:** ${options.prize}`)
      .addFields(
        { name: 'Ends', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true },
        { name: 'Winners', value: String(options.winnerCount), inline: true },
      )
      .setFooter({ text: 'Click the button to enter!' })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('🎉 Enter Giveaway')
        .setStyle(ButtonStyle.Success),
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    await GiveawayModel.create({
      messageId: msg.id,
      channelId: options.channelId,
      guildId: options.guildId,
      prize: options.prize,
      winnerCount: options.winnerCount,
      duration: options.duration,
      endTime,
      requiredRole: options.requiredRole,
      requiredInvites: options.requiredInvites,
      bonusEntries: options.bonusEntries,
      entrants: [],
      winners: [],
    });

    setTimeout(() => this.endGiveaway(msg.id), options.duration);

    return { messageId: msg.id };
  }

  public async endGiveaway(messageId: string): Promise<void> {
    const giveaway = await GiveawayModel.findOne({ messageId });
    if (!giveaway || giveaway.ended) return;

    giveaway.ended = true;

    if (giveaway.entrants.length === 0) {
      giveaway.winners = [];
      await giveaway.save();
      await this.updateGiveawayMessage(giveaway);
      return;
    }

    const winners: string[] = [];
    const eligible = [...giveaway.entrants];

    for (let i = 0; i < giveaway.winnerCount && eligible.length > 0; i++) {
      const winnerIndex = Math.floor(Math.random() * eligible.length);
      const winner = eligible[winnerIndex]!;
      winners.push(winner);
      eligible.splice(winnerIndex, 1);
    }

    giveaway.winners = winners;
    await giveaway.save();

    await this.updateGiveawayMessage(giveaway);

    const channel = this.client.channels.cache.get(giveaway.channelId) as TextChannel;
    if (channel && winners.length > 0) {
      const winnerMentions = winners.map((id) => `<@${id}>`).join(', ');
      await channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
    }
  }

  public async rerollGiveaway(messageId: string): Promise<string[]> {
    const giveaway = await GiveawayModel.findOne({ messageId });
    if (!giveaway) throw new Error('Giveaway not found');

    const eligible = giveaway.entrants.filter((e) => !giveaway.winners.includes(e));

    if (eligible.length === 0) return [];

    const newWinner = eligible[Math.floor(Math.random() * eligible.length)]!;
    giveaway.winners = [newWinner];
    await giveaway.save();

    return [newWinner];
  }

  private async updateGiveawayMessage(giveaway: Record<string, any>): Promise<void> {
    try {
      const channel = this.client.channels.cache.get(giveaway.channelId) as TextChannel;
      if (!channel) return;

      const msg = await channel.messages.fetch(giveaway.messageId);
      if (!msg) return;

      const embed = EmbedBuilder.from(msg.embeds[0]!)
        .setColor(EMBED_COLORS.error)
        .setDescription(`**Prize:** ${giveaway.prize}\n\n**Ended:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`)
        .setFooter({ text: 'Giveaway ended' });

      if (giveaway.winners.length > 0) {
        embed.addFields({
          name: 'Winners',
          value: giveaway.winners.map((id: string) => `<@${id}>`).join(', '),
        });
      } else {
        embed.addFields({ name: 'Winners', value: 'No winners' });
      }

      await msg.edit({ embeds: [embed], components: [] });
    } catch {
      // Message may be deleted
    }
  }
}
