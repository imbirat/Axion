import { TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { AxionClient } from '../structures/AxionClient';
import { PollModel } from '../models';
import { EMBED_COLORS } from '../constants';

export class PollManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async init(): Promise<void> {
    await this.resumeActivePolls();
    this.client.logger.info('Poll manager initialized');
  }

  private async resumeActivePolls(): Promise<void> {
    const activePolls = await PollModel.find({ ended: false, endTime: { $ne: null } });

    for (const poll of activePolls) {
      if (!poll.endTime) continue;
      const now = Date.now();
      const endTime = poll.endTime.getTime();

      if (endTime <= now) {
        await this.endPoll(poll.messageId);
      } else {
        setTimeout(() => this.endPoll(poll.messageId), endTime - now);
      }
    }
  }

  public async createPoll(options: {
    channelId: string;
    guildId: string;
    question: string;
    options: string[];
    multiChoice: boolean;
    requiredRole: string | null;
    duration: number | null;
  }): Promise<{ messageId: string }> {
    const channel = this.client.channels.cache.get(options.channelId) as TextChannel;
    if (!channel) throw new Error('Channel not found');

    const endTime = options.duration ? new Date(Date.now() + options.duration) : null;

    const voteCounts = new Map<string, number>();
    for (const opt of options) {
      voteCounts.set(opt, 0);
    }

    const optionLabels = '🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯';
    const description = options
      .map((opt, i) => `${optionLabels[i] ?? '❓'} ${opt}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle(`📊 ${options.question}`)
      .setDescription(description)
      .addFields(
        { name: 'Total Votes', value: '0', inline: true },
        { name: 'Multi-choice', value: options.multiChoice ? 'Yes' : 'No', inline: true },
      );

    if (endTime) {
      embed.addFields({ name: 'Ends', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true });
    }

    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 0; i < Math.min(options.length, 5); i++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_vote_${i}`)
          .setEmoji(optionLabels[i]!)
          .setStyle(ButtonStyle.Secondary),
      );
    }

    const msg = await channel.send({ embeds: [embed], components: [row] });

    await PollModel.create({
      messageId: msg.id,
      channelId: options.channelId,
      guildId: options.guildId,
      question: options.question,
      options,
      votes: new Map(),
      voteCounts,
      multiChoice: options.multiChoice,
      requiredRole: options.requiredRole,
      endTime,
      ended: false,
    });

    if (endTime) {
      setTimeout(() => this.endPoll(msg.id), options.duration);
    }

    return { messageId: msg.id };
  }

  public async vote(messageId: string, userId: string, optionIndex: number): Promise<void> {
    const poll = await PollModel.findOne({ messageId });
    if (!poll) throw new Error('Poll not found');
    if (poll.ended) throw new Error('Poll has ended');

    if (poll.requiredRole) {
      const guild = this.client.guilds.cache.get(poll.guildId);
      if (guild) {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member || !member.roles.cache.has(poll.requiredRole)) {
          throw new Error('You do not have the required role to vote');
        }
      }
    }

    const optionKey = String(optionIndex);
    const selectedOption = poll.options[optionIndex];
    if (!selectedOption) throw new Error('Invalid option');

    if (!poll.multiChoice) {
      const currentVote = poll.votes.get(userId);
      if (currentVote !== undefined) {
        const currentCount = poll.voteCounts.get(poll.options[parseInt(currentVote)]!) ?? 0;
        poll.voteCounts.set(poll.options[parseInt(currentVote)]!, Math.max(0, currentCount - 1));
      }
    }

    poll.votes.set(userId, optionKey);
    const newCount = (poll.voteCounts.get(selectedOption) ?? 0) + 1;
    poll.voteCounts.set(selectedOption, newCount);

    await poll.save();
    await this.updatePollMessage(poll);
  }

  public async endPoll(messageId: string): Promise<void> {
    const poll = await PollModel.findOne({ messageId });
    if (!poll || poll.ended) return;

    poll.ended = true;
    await poll.save();
    await this.updatePollMessage(poll, true);
  }

  private async updatePollMessage(poll: Record<string, any>, ended = false): Promise<void> {
    try {
      const channel = this.client.channels.cache.get(poll.channelId) as TextChannel;
      if (!channel) return;

      const msg = await channel.messages.fetch(poll.messageId);
      if (!msg) return;

      const totalVotes = Array.from(poll.voteCounts.values()).reduce((a: number, b: number) => a + b, 0);
      const optionLabels = '🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯';

      const maxVotes = Math.max(1, ...Array.from(poll.voteCounts.values()));

      const description = poll.options
        .map((opt: string, i: number) => {
          const count = poll.voteCounts.get(opt) ?? 0;
          const barLength = Math.round((count / maxVotes) * 10);
          const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
          return `${optionLabels[i] ?? '❓'} ${opt}\n${bar} ${count} votes`;
        })
        .join('\n\n');

      const embed = EmbedBuilder.from(msg.embeds[0]!)
        .setDescription(description)
        .setColor(ended ? EMBED_COLORS.error : EMBED_COLORS.primary)
        .setFields(
          { name: 'Total Votes', value: String(totalVotes), inline: true },
          { name: 'Status', value: ended ? 'Ended' : 'Active', inline: true },
        );

      if (ended) {
        await msg.edit({ embeds: [embed], components: [] });
      } else {
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let i = 0; i < Math.min(poll.options.length, 5); i++) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`poll_vote_${i}`)
              .setEmoji(optionLabels[i]!)
              .setStyle(ButtonStyle.Secondary),
          );
        }
        await msg.edit({ embeds: [embed], components: [row] });
      }
    } catch {
      // Message may be deleted
    }
  }
}
