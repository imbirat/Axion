import { Command } from '../../structures/Command';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, version } from 'discord.js';
import { EMBED_COLORS, SUPPORT_SERVER, INVITE_LINK } from '../../constants';

export default new Command({
  name: 'botinfo',
  description: 'Shows information about the bot',
  category: 'utility',
  type: 'both',
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const bot = client.user!;
    const uptime = Math.floor(client.uptime ?? 0 / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.primary)
      .setTitle('Axion')
      .setThumbnail(bot.displayAvatarURL())
      .setDescription('Axion is an all-in-one bot providing premium features for free')
      .addFields(
        { name: `Node.js ${process.version}`, value: `Ping: ${client.ws.ping}ms`, inline: true },
        { name: 'Owner', value: '<@1229349314736951321>', inline: true },
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
        { name: 'Discord.js', value: `v${version}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
      )
      .setFooter({ text: 'made by Axion team' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Support')
        .setStyle(ButtonStyle.Link)
        .setURL(SUPPORT_SERVER),
      new ButtonBuilder()
        .setLabel('Invite Bot')
        .setStyle(ButtonStyle.Link)
        .setURL(INVITE_LINK),
    );

    if (isSlash) {
      await interaction.reply({ embeds: [embed], components: [row] });
    } else {
      await (interaction as any).reply({ embeds: [embed], components: [row] });
    }
  },
});
