import { Shoukaku, Connectors } from 'shoukaku';
import { AxionClient } from '../../structures/AxionClient';

export class LavalinkService {
  private client: AxionClient;
  public shoukaku: Shoukaku | null = null;
  public shoukakuNodes: { name: string; url: string; auth: string; secure: boolean }[];
  public shoukakuOptions: Record<string, unknown>;

  constructor(client: AxionClient) {
    this.client = client;

    this.shoukakuNodes = [
      {
        name: 'Lavalink',
        url: `${client.config.lavalinkHost}:${client.config.lavalinkPort}`,
        auth: client.config.lavalinkPassword,
        secure: client.config.lavalinkSecure,
      },
    ];

    this.shoukakuOptions = {
      moveOnDisconnect: false,
      resumable: true,
      resumableTimeout: 30,
      reconnectTries: 5,
      reconnectDelay: 5000,
      userAgent: 'Axion/1.0',
    };
  }

  public async connect(): Promise<void> {
    if (!this.client.config.lavalinkHost) {
      this.client.logger.warn('Lavalink host not configured');
      return;
    }

    try {
      const connector = new Connectors.DiscordJS(this.client);

      this.shoukaku = new Shoukaku(connector, this.shoukakuNodes, {
        ...this.shoukakuOptions,
        nodeResolver: (nodes) => {
          const availableNodes = [...nodes.values()].filter((node) => node.state === 2);
          return availableNodes[0];
        },
      } as any);

      this.shoukaku.on('ready', (name: string) => {
        this.client.logger.info(`Lavalink node "${name}" connected`);
      });

      this.shoukaku.on('error', (name: string, error: Error) => {
        this.client.logger.error(`Lavalink node "${name}" error:`, error);
      });

      this.shoukaku.on('close', (name: string, code: number, reason: string) => {
        this.client.logger.warn(`Lavalink node "${name}" closed: ${code} ${reason}`);
      });

      this.shoukaku.on('debug', (name: string, info: string) => {
        this.client.logger.debug(`Lavalink debug [${name}]: ${info}`);
      });

      this.client.logger.info('Lavalink service initialized');
    } catch (error) {
      this.client.logger.error('Failed to initialize Lavalink:', error);
    }
  }
}
