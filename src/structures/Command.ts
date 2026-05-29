import {
  PermissionResolvable,
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { CommandCategory, SlashCommandOption, CommandExecuteFunction, CommandType } from '../types';

export class Command {
  public name: string;
  public description: string;
  public category: CommandCategory;
  public usage: string;
  public aliases: string[];
  public cooldown: number;
  public permissions: PermissionResolvable[];
  public botPermissions: PermissionResolvable[];
  public ownerOnly: boolean;
  public guildOnly: boolean;
  public type: CommandType;
  public options: SlashCommandOption[];
  public execute: CommandExecuteFunction;

  constructor(options: {
    name: string;
    description: string;
    category: CommandCategory;
    usage?: string;
    aliases?: string[];
    cooldown?: number;
    permissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    ownerOnly?: boolean;
    guildOnly?: boolean;
    type?: CommandType;
    options?: SlashCommandOption[];
    execute: CommandExecuteFunction;
  }) {
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.usage = options.usage ?? `/${options.name}`;
    this.aliases = options.aliases ?? [];
    this.cooldown = options.cooldown ?? 0;
    this.permissions = options.permissions ?? [];
    this.botPermissions = options.botPermissions ?? [];
    this.ownerOnly = options.ownerOnly ?? false;
    this.guildOnly = options.guildOnly ?? true;
    this.type = options.type ?? 'both';
    this.options = options.options ?? [];
    this.execute = options.execute;
  }

  public toSlashCommand(): SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);

    if (this.permissions.length > 0) {
      builder.setDefaultMemberPermissions(
        this.permissions.reduce((acc, p) => acc | (typeof p === 'bigint' ? p : 0n), 0n),
      );
    }

    for (const opt of this.options) {
      switch (opt.type) {
        case 'string':
          builder.addStringOption((o) => {
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false);
            if (opt.choices) o.addChoices(...opt.choices);
            if (opt.minLength) o.setMinLength(opt.minLength);
            if (opt.maxLength) o.setMaxLength(opt.maxLength);
            return o;
          });
          break;
        case 'integer':
          builder.addIntegerOption((o) => {
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false);
            if (opt.choices) o.addChoices(...opt.choices.map((c) => ({ name: c.name, value: c.value as number })));
            if (opt.minValue !== undefined) o.setMinValue(opt.minValue);
            if (opt.maxValue !== undefined) o.setMaxValue(opt.maxValue);
            return o;
          });
          break;
        case 'number':
          builder.addNumberOption((o) => {
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false);
            if (opt.minValue !== undefined) o.setMinValue(opt.minValue);
            if (opt.maxValue !== undefined) o.setMaxValue(opt.maxValue);
            return o;
          });
          break;
        case 'boolean':
          builder.addBooleanOption((o) =>
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false),
          );
          break;
        case 'user':
          builder.addUserOption((o) =>
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false),
          );
          break;
        case 'channel':
          builder.addChannelOption((o) =>
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false),
          );
          break;
        case 'role':
          builder.addRoleOption((o) =>
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false),
          );
          break;
        case 'mentionable':
          builder.addMentionableOption((o) =>
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false),
          );
          break;
        case 'attachment':
          builder.addAttachmentOption((o) =>
            o.setName(opt.name).setDescription(opt.description).setRequired(opt.required ?? false),
          );
          break;
      }
    }

    return builder;
  }

  public isInteraction(command: ChatInputCommandInteraction | Message): command is ChatInputCommandInteraction {
    return command instanceof ChatInputCommandInteraction;
  }

  public isMessage(command: ChatInputCommandInteraction | Message): command is Message {
    return command instanceof Message;
  }
}
