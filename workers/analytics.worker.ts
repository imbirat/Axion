import { parentPort } from 'worker_threads';

interface AnalyticsTask {
  type: 'process_guild_stats' | 'generate_report';
  guildId?: string;
  data?: Record<string, unknown>;
}

if (parentPort) {
  parentPort.on('message', async (task: AnalyticsTask) => {
    try {
      if (task.type === 'process_guild_stats') {
        const result = {
          guildId: task.guildId,
          processed: true,
          timestamp: new Date().toISOString(),
        };
        parentPort!.postMessage({ success: true, data: result });
      } else if (task.type === 'generate_report') {
        const report = {
          generated: true,
          data: task.data,
          timestamp: new Date().toISOString(),
        };
        parentPort!.postMessage({ success: true, data: report });
      }
    } catch (error: any) {
      parentPort!.postMessage({ success: false, error: error.message });
    }
  });
}
