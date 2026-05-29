import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { QuoteModel } from '../../models';
import { EMBED_COLORS } from '../../constants';
import crypto from 'crypto';

export default new Command({
  name: 'quote',
  description: 'Manage quotes',
  category: 'quotes',
  type: 'both',
  options: [
    { name: 'action', description: 'add, get, random, delete, or list', type: 'string', required: true, choices: [{ name: 'add', value: 'add' }, { name: 'get', value: 'get' }, { name: 'random', value: 'random' }, { name: 'delete', value: 'delete' }, { name: 'list', value: 'list' }] },
    { name: 'content', description: 'Quote content (for add)', type: 'string', required: false },
    { name: 'author', description: 'Quote author (for add)', type: 'string', required: false },
    { name: 'id', description: 'Quote ID (for get/delete)', type: 'string', required: false },
  ],
  async execute(client, interaction) {
    const isSlash = interaction.isChatInputCommand?.() ?? false;
    const guild = interaction.guild;
    if (!guild) return;

    let action: string;
    if (isSlash) action = interaction.options.getString('action', true);
    else {
      const args = (interaction as any).args as string[];
      action = args?.[0] ?? 'random';
    }

    switch (action) {
      case 'add': {
        let content: string, author: string;
        if (isSlash) {
          content = interaction.options.getString('content', true);
          author = interaction.options.getString('author') ?? interaction.user.tag;
        } else {
          const args = (interaction as any).args as string[];
          author = args?.[1] ?? interaction.author?.tag ?? interaction.user?.tag;
          content = args?.slice(2).join(' ') ?? '';
        }
        const quoteId = crypto.randomBytes(4).toString('hex');
        await QuoteModel.create({ quoteId, guildId: guild.id, content, authorId: interaction.user?.id ?? (interaction as any).author?.id, authorTag: author });
        await interaction.reply({ content: `✅ Quote added! ID: ${quoteId}` });
        break;
      }
      case 'get': {
        let quoteId: string;
        if (isSlash) quoteId = interaction.options.getString('id', true);
        else {
          const args = (interaction as any).args as string[];
          quoteId = args?.[1] ?? '';
        }
        const quote = await QuoteModel.findOne({ quoteId, guildId: guild.id });
        if (!quote) { await interaction.reply({ content: 'Quote not found.', ephemeral: true }); return; }
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.primary)
          .setDescription(quote.content)
          .setFooter({ text: `— ${quote.authorTag} | ID: ${quote.quoteId}` });
        if (isSlash) await interaction.reply({ embeds: [embed] });
        else await (interaction as any).reply({ embeds: [embed] });
        break;
      }
      case 'random': {
        const count = await QuoteModel.countDocuments({ guildId: guild.id });
        if (count === 0) { await interaction.reply({ content: 'No quotes yet.', ephemeral: true }); return; }
        const random = await QuoteModel.aggregate([{ $match: { guildId: guild.id } }, { $sample: { size: 1 } }]);
        const quote = random[0];
        if (!quote) { await interaction.reply({ content: 'No quotes found.', ephemeral: true }); return; }
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.primary)
          .setDescription(quote.content)
          .setFooter({ text: `— ${quote.authorTag} | ID: ${quote.quoteId} | #${quote._id}` });
        if (isSlash) await interaction.reply({ embeds: [embed] });
        else await (interaction as any).reply({ embeds: [embed] });
        break;
      }
      case 'delete': {
        let quoteId: string;
        if (isSlash) quoteId = interaction.options.getString('id', true);
        else {
          const args = (interaction as any).args as string[];
          quoteId = args?.[1] ?? '';
        }
        const result = await QuoteModel.findOneAndDelete({ quoteId, guildId: guild.id });
        if (!result) { await interaction.reply({ content: 'Quote not found.', ephemeral: true }); return; }
        await interaction.reply({ content: '✅ Quote deleted.' });
        break;
      }
      case 'list': {
        const quotes = await QuoteModel.find({ guildId: guild.id }).limit(25);
        if (quotes.length === 0) { await interaction.reply({ content: 'No quotes.', ephemeral: true }); return; }
        const list = quotes.map((q, i) => `${i + 1}. "${q.content.slice(0, 50)}..." — ${q.authorTag} (\`${q.quoteId}\`)`).join('\n');
        await interaction.reply({ content: `📚 **Quotes:**\n${list}` });
        break;
      }
    }
  },
});
