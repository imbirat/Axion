import { TextChannel, EmbedBuilder } from 'discord.js';
import { AxionClient } from '../structures/AxionClient';
import { BirthdayModel, GuildModel } from '../models';
import { EMBED_COLORS } from '../constants';
import cron from 'node-cron';

export class BirthdayManager {
  private client: AxionClient;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async init(): Promise<void> {
    cron.schedule('0 8 * * *', () => this.checkBirthdays());
    this.client.logger.info('Birthday manager initialized');
  }

  private async checkBirthdays(): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const todaysBirthdays = await BirthdayModel.aggregate([
      { $match: { month, day } },
      { $group: { _id: '$guildId', users: { $push: '$$ROOT' } } },
    ]);

    for (const group of todaysBirthdays) {
      const guildId = group._id as string;
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) continue;

      const guildConfig = await GuildModel.findOne({ guildId });
      if (!guildConfig?.birthdayConfig?.enabled) continue;

      const channelId = guildConfig.birthdayConfig.channelId;
      if (!channelId) continue;

      const channel = this.client.channels.cache.get(channelId) as TextChannel;
      if (!channel) continue;

      const roleId = guildConfig.birthdayConfig.roleId;

      for (const bday of group.users) {
        try {
          const member = await guild.members.fetch(bday.userId);

          const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.primary)
            .setTitle('🎂 Happy Birthday!')
            .setDescription(`Happy birthday <@${bday.userId}>! 🎉🎂`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

          await channel.send({ embeds: [embed] });

          if (roleId) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
              await member.roles.add(role).catch(() => {});

              setTimeout(async () => {
                try {
                  await member.roles.remove(role);
                } catch {}
              }, 86400000);
            }
          }
        } catch {}
      }
    }
  }

  public async setBirthday(
    userId: string,
    guildId: string,
    day: number,
    month: number,
    year: number | null,
  ): Promise<void> {
    await BirthdayModel.findOneAndUpdate(
      { userId, guildId },
      { userId, guildId, day, month, year },
      { upsert: true },
    );
  }

  public async removeBirthday(userId: string, guildId: string): Promise<void> {
    await BirthdayModel.deleteOne({ userId, guildId });
  }

  public async getBirthdays(guildId: string) {
    return BirthdayModel.find({ guildId });
  }

  public async getUserBirthday(userId: string, guildId: string) {
    return BirthdayModel.findOne({ userId, guildId });
  }
}
