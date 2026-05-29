import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';

export class Pagination {
  private embeds: EmbedBuilder[];
  private interaction: ChatInputCommandInteraction;
  private userId: string;
  private time: number;
  private currentPage: number;

  constructor(options: {
    embeds: EmbedBuilder[];
    interaction: ChatInputCommandInteraction;
    userId: string;
    time?: number;
  }) {
    this.embeds = options.embeds;
    this.interaction = options.interaction;
    this.userId = options.userId;
    this.time = options.time ?? 120_000;
    this.currentPage = 0;
  }

  private createButtons(): ActionRowBuilder<ButtonBuilder>[] {
    if (this.embeds.length <= 1) return [];

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('paginate_first')
        .setEmoji('⏮')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId('paginate_prev')
        .setEmoji('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId('paginate_info')
        .setLabel(`${this.currentPage + 1} / ${this.embeds.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('paginate_next')
        .setEmoji('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === this.embeds.length - 1),
      new ButtonBuilder()
        .setCustomId('paginate_last')
        .setEmoji('⏭')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === this.embeds.length - 1),
    );

    return [row];
  }

  public async start(): Promise<void> {
    const reply = await this.interaction.reply({
      embeds: [this.embeds[0]!],
      components: this.createButtons(),
      fetchReply: true,
    });

    if (this.embeds.length <= 1) return;

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: this.time,
    });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.user.id !== this.userId) {
        await buttonInteraction.reply({
          content: '❌ This menu is not for you.',
          ephemeral: true,
        });
        return;
      }

      switch (buttonInteraction.customId) {
        case 'paginate_first':
          this.currentPage = 0;
          break;
        case 'paginate_prev':
          this.currentPage = Math.max(0, this.currentPage - 1);
          break;
        case 'paginate_next':
          this.currentPage = Math.min(this.embeds.length - 1, this.currentPage + 1);
          break;
        case 'paginate_last':
          this.currentPage = this.embeds.length - 1;
          break;
      }

      const embeds = [this.embeds[this.currentPage]!];
      await buttonInteraction.update({
        embeds,
        components: this.createButtons(),
      });
    });

    collector.on('end', async () => {
      try {
        await reply.edit({ components: [] });
      } catch {
        // Reply might be deleted
      }
    });
  }

  public static async createSimplePaginator(
    interaction: ChatInputCommandInteraction,
    embeds: EmbedBuilder[],
    userId: string,
    time = 120_000,
  ): Promise<void> {
    const paginator = new Pagination({ embeds, interaction, userId, time });
    await paginator.start();
  }
}
