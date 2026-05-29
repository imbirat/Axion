import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { EMBED_COLORS, BOT_NAME } from '../constants';

export function createEmbed(options: {
  title?: string;
  description?: string;
  color?: ColorResolvable;
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnail?: string;
  image?: string;
  author?: { name: string; iconURL?: string };
  footer?: { text: string; iconURL?: string };
  timestamp?: boolean;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(options.color ?? EMBED_COLORS.default);

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.author) embed.setAuthor(options.author);
  if (options.footer) embed.setFooter(options.footer);
  if (options.timestamp) embed.setTimestamp();

  return embed;
}

export function successEmbed(description: string): EmbedBuilder {
  return createEmbed({ description, color: EMBED_COLORS.success });
}

export function errorEmbed(description: string): EmbedBuilder {
  return createEmbed({ description, color: EMBED_COLORS.error });
}

export function warningEmbed(description: string): EmbedBuilder {
  return createEmbed({ description, color: EMBED_COLORS.warning });
}

export function infoEmbed(description: string): EmbedBuilder {
  return createEmbed({ description, color: EMBED_COLORS.info });
}
