import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AxionClient } from '../../structures/AxionClient';
import { AIConversationModel, AIUsageModel } from '../../models';

export class GeminiClient {
  private client: AxionClient;
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private maxHistoryTurns = 20;
  private dailyLimit = 50;

  constructor(client: AxionClient) {
    this.client = client;
  }

  public async init(): Promise<void> {
    if (!this.client.config.geminiApiKey) {
      this.client.logger.warn('Gemini API key not configured — AI features disabled');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.client.config.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      this.client.logger.info('Gemini AI initialized with gemini-2.5-flash');
    } catch (error) {
      this.client.logger.error('Failed to initialize Gemini:', error);
    }
  }

  private isReady(): boolean {
    return this.model !== null;
  }

  public async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isReady()) throw new Error('Gemini AI is not initialized');

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      });

      return result.response.text();
    } catch (error) {
      this.client.logger.error('Gemini API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  public async chat(
    userId: string,
    guildId: string,
    message: string,
  ): Promise<string> {
    if (!this.isReady()) throw new Error('Gemini AI is not initialized');

    const canProceed = await this.checkRateLimit(userId);
    if (!canProceed) throw new Error('Daily AI usage limit reached');

    const conversation = await AIConversationModel.findOne({ userId, guildId }) ?? {
      userId,
      guildId,
      messages: [],
      context: null,
    };

    const history = (conversation.messages ?? []).slice(-this.maxHistoryTurns);

    const contents = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    contents.push({ role: 'user', parts: [{ text: message }] });

    try {
      const result = await this.model!.generateContent({
        contents,
        systemInstruction: {
          role: 'system',
          parts: [{
            text: 'You are Axion AI, a helpful Discord bot assistant. Be concise, friendly, and helpful. Keep responses under 2000 characters when possible. Do not generate harmful, offensive, or inappropriate content.',
          }],
        },
      });

      const response = result.response.text();

      await AIConversationModel.findOneAndUpdate(
        { userId, guildId },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: message, timestamp: new Date() },
                { role: 'assistant', content: response, timestamp: new Date() },
              ],
            },
          },
        },
        { upsert: true },
      );

      await this.incrementUsage(userId);

      return response;
    } catch (error) {
      this.client.logger.error('Gemini chat error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  public async summariseContent(content: string): Promise<string> {
    if (!this.isReady()) throw new Error('Gemini AI is not initialized');

    const prompt = `Please summarise the following content concisely:\n\n${content}`;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return result.response.text();
    } catch (error) {
      this.client.logger.error('Gemini summarisation error:', error);
      throw new Error('Failed to summarise content');
    }
  }

  public async generateEmbed(title: string, description: string): Promise<{ title: string; description: string; color: string }> {
    if (!this.isReady()) throw new Error('Gemini AI is not initialized');

    const prompt = `Generate a Discord embed with the following:
Title: ${title}
Description: ${description}

Return a JSON object with keys: title, description, color (hex code)`;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as { title: string; description: string; color: string };
      }

      return { title, description, color: '#5865F2' };
    } catch {
      return { title, description, color: '#5865F2' };
    }
  }

  public async moderateContent(content: string): Promise<{ flagged: boolean; reason: string }> {
    if (!this.isReady()) return { flagged: false, reason: '' };

    const prompt = `Analyse the following message for Discord server violations. Check for: harassment, hate speech, NSFW content, spam, phishing, personal information sharing.

Message: "${content}"

Reply with a JSON object: { "flagged": boolean, "reason": "string" }`;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { flagged: false, reason: '' };
    } catch {
      return { flagged: false, reason: '' };
    }
  }

  public async generateInsights(data: string): Promise<string> {
    if (!this.isReady()) throw new Error('Gemini AI is not initialized');

    const prompt = `Analyse the following Discord server activity data and provide insights and recommendations:\n\n${data}`;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return result.response.text();
    } catch (error) {
      this.client.logger.error('Gemini insights error:', error);
      throw new Error('Failed to generate insights');
    }
  }

  public async summariseTicket(messages: { author: string; content: string }[]): Promise<string> {
    if (!this.isReady()) return 'AI not available';

    const conversation = messages.map((m) => `${m.author}: ${m.content}`).join('\n');
    const prompt = `Summarise this Discord ticket conversation, highlighting the key issue and resolution:\n\n${conversation}`;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return result.response.text();
    } catch {
      return 'Failed to summarise ticket';
    }
  }

  public async clearConversation(userId: string, guildId: string): Promise<void> {
    await AIConversationModel.deleteOne({ userId, guildId });
  }

  private async checkRateLimit(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]!;
    const usage = await AIUsageModel.findOne({ userId, date: today });

    if (usage && usage.count >= this.dailyLimit) {
      return false;
    }

    return true;
  }

  private async incrementUsage(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;

    await AIUsageModel.findOneAndUpdate(
      { userId, date: today },
      { $inc: { count: 1 } },
      { upsert: true },
    );
  }
}
