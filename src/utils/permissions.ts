import {
  GuildMember,
  PermissionResolvable,
  ChatInputCommandInteraction,
  Message,
  TextChannel,
} from 'discord.js';
import { AxionClient } from '../structures/AxionClient';

export async function checkPermissions(
  client: AxionClient,
  interaction: ChatInputCommandInteraction | Message,
  permissions: PermissionResolvable[],
  botPermissions: PermissionResolvable[],
): Promise<boolean> {
  const member = interaction instanceof ChatInputCommandInteraction
    ? interaction.member as GuildMember
    : interaction.member as GuildMember;

  if (!member) return false;

  const channel = interaction instanceof ChatInputCommandInteraction
    ? interaction.channel as TextChannel
    : interaction.channel as TextChannel;

  if (!channel) return false;

  if (client.isOwner(member.id)) return true;

  if (permissions.length > 0) {
    const hasPerms = permissions.every((perm) => member.permissions.has(perm));
    if (!hasPerms) return false;
  }

  if (botPermissions.length > 0) {
    const botMember = channel.guild?.members.me;
    if (botMember) {
      const hasBotPerms = botPermissions.every((perm) => botMember.permissions.has(perm));
      if (!hasBotPerms) return false;
    }
  }

  return true;
}

export function getHierarchy(member: GuildMember): number {
  if (!member.guild.ownerId) return 0;
  if (member.id === member.guild.ownerId) return Number.MAX_SAFE_INTEGER;
  return member.roles.highest.position;
}

export function isHigher(target: GuildMember, author: GuildMember): boolean {
  return getHierarchy(target) < getHierarchy(author);
}
