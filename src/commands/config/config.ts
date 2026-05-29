import { Command } from '../../structures/Command';
import { PermissionFlagsBits } from 'discord.js';
import { GuildModel } from '../../models';

const CONFIG_KEYS = [
  { module: 'automod', settings: ['enabled', 'spam', 'mentionSpam', 'links', 'invites', 'caps', 'blockedWords', 'scamLinks', 'attachments', 'action'] },
  { module: 'antinuke', settings: ['enabled', 'threshold', 'action'] },
  { module: 'logging', settings: ['enabled', 'channelId'] },
  { module: 'verification', settings: ['enabled', 'mode', 'verifiedRole', 'minAccountAge'] },
  { module: 'welcome', settings: ['enabled', 'channelId', 'message', 'embed'] },
  { module: 'farewell', settings: ['enabled', 'channelId', 'message', 'embed'] },
  { module: 'booster', settings: ['enabled', 'channelId', 'message'] },
  { module: 'levelup', settings: ['enabled', 'channelId'] },
  { module: 'autorole', settings: ['enabled'] },
  { module: 'birthday', settings: ['enabled', 'channelId', 'roleId'] },
];

export default new Command({
  name: 'config',
  description: 'Configure bot modules (admin only)',
  category: 'config',
  permissions: [PermissionFlagsBits.Administrator],
  type: 'both',
  options: [
    { name: 'module', description: 'Module name', type: 'string', required: true, choices: CONFIG_KEYS.map((k) => ({ name: k.module, value: k.module })) },
    { name: 'setting', description: 'Setting name', type: 'string', required: false },
    { name: 'value', description: 'Setting value', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let module: string, setting: string | null = null, value: string | null = null;
    if (isSlash) {
      module = interaction.options.getString('module', true);
      setting = interaction.options.getString('setting');
      value = interaction.options.getString('value');
    } else {
      const args = (interaction as any).args as string[];
      module = args?.[0] ?? '';
      setting = args?.[1] ?? null;
      value = args?.slice(2).join(' ') || null;
    }

    const configKey = CONFIG_KEYS.find((k) => k.module === module);
    if (!configKey) {
      const msg = `Unknown module: ${module}. Available: ${CONFIG_KEYS.map((k) => k.module).join(', ')}`;
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    if (!setting) {
      const msg = `Module: **${module}**\nSettings: ${configKey.settings.map((s) => `\`${s}\``).join(', ')}\nUsage: /config ${module} <setting> <value>`;
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    if (value === null) {
      const msg = 'Please provide a value.';
      if (isSlash) await interaction.reply({ content: msg, ephemeral: true });
      else await (interaction as any).reply(msg);
      return;
    }

    let updatePath: string;
    let parsedValue: any = value;

    if (setting === 'enabled') {
      parsedValue = value === 'true' || value === 'yes' || value === '1';
      updatePath = `modules.${module}`;
    } else if (setting === 'action') {
      updatePath = `${module === 'automod' ? 'automodConfig' : `${module}Config`}.action`;
    } else if (['spam', 'mentionSpam', 'links', 'invites', 'caps', 'blockedWords', 'scamLinks', 'attachments'].includes(setting)) {
      parsedValue = value === 'true' || value === 'yes' || value === '1';
      updatePath = `automodConfig.${setting}`;
    } else if (setting === 'channelId' || setting === 'verifiedRole' || setting === 'roleId') {
      const id = value.replace(/[<#>]/g, '');
      parsedValue = id;
      if (['channelId'].includes(setting)) {
        updatePath = `${module}Config.channelId`; // The module name matches the config key
        if (module === 'logging') updatePath = 'loggingConfig.channelId';
        else if (module === 'verification') updatePath = 'verificationConfig.channelId';
        else if (module === 'welcome') updatePath = 'welcomeConfig.channelId';
        else if (module === 'farewell') updatePath = 'farewellConfig.channelId';
        else if (module === 'booster') updatePath = 'boosterConfig.channelId';
        else if (module === 'levelup') updatePath = 'levelupConfig.channelId';
        else if (module === 'birthday') updatePath = 'birthdayConfig.channelId';
      }
    } else {
      updatePath = `${module}Config.${setting}`;
    }

    if (module === 'verification' && setting === 'mode') {
      if (!['button', 'math', 'image'].includes(value)) {
        await interaction.reply({ content: 'Mode must be: button, math, or image.', ephemeral: true });
        return;
      }
      updatePath = 'verificationConfig.mode';
    }

    if (setting === 'message' && value) {
      updatePath = `${module}Config.message`;
    }

    await GuildModel.findOneAndUpdate(
      { guildId: guild.id },
      { $set: { [updatePath]: parsedValue } },
      { upsert: true },
    );

    await client.cache.invalidate('guild', guild.id);

    const msg = `✅ Module **${module}**: \`${setting}\` set to \`${String(parsedValue)}\``;
    if (isSlash) await interaction.reply({ content: msg });
    else await (interaction as any).reply(msg);
  },
});
