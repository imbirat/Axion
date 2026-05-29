import { Guild, Invite, Collection } from 'discord.js';
import { AxionClient } from '../../structures/AxionClient';

export class InviteTracker {
  private client: AxionClient;
  private cache: Map<string, Collection<string, Invite>>;

  constructor(client: AxionClient) {
    this.client = client;
    this.cache = new Map();
  }

  public async cacheGuildInvites(guild: Guild): Promise<void> {
    try {
      const invites = await guild.invites.fetch();
      this.cache.set(guild.id, invites);
    } catch {
      // Missing permissions to fetch invites
    }
  }

  public async getInviter(guild: Guild, code: string): Promise<string | null> {
    try {
      const newInvites = await guild.invites.fetch();
      const oldInvites = this.cache.get(guild.id);

      if (!oldInvites) {
        this.cache.set(guild.id, newInvites);
        return null;
      }

      for (const [inviteId, invite] of newInvites) {
        const old = oldInvites.get(inviteId);
        if (!old && invite.inviter) {
          return invite.inviter.id;
        }

        if (old && invite.uses !== undefined && old.uses !== undefined && invite.uses > old.uses) {
          if (invite.inviter) {
            return invite.inviter.id;
          }
        }
      }

      this.cache.set(guild.id, newInvites);
      return null;
    } catch {
      this.cache.set(guild.id, await guild.invites.fetch().catch(() => new Collection()));
      return null;
    }
  }
}
