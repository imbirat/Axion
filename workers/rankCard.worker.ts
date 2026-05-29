import { parentPort } from 'worker_threads';

if (parentPort) {
  parentPort.on('message', async (data: { userId: string; username: string; level: number; xp: number; neededXp: number; avatarUrl: string }) => {
    try {
      const { createCanvas, loadImage, registerFont } = await import('canvas');

      const width = 800;
      const height = 250;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#5865F2');
      gradient.addColorStop(1, '#9B59B6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(20, 20, width - 40, height - 40);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(data.username, 160, 80);

      ctx.font = '24px Arial';
      ctx.fillStyle = '#B0B0B0';
      ctx.fillText(`Level ${data.level}`, 160, 120);

      const barWidth = 500;
      const barHeight = 30;
      const barX = 160;
      const barY = 150;
      const progress = data.neededXp > 0 ? data.xp / data.neededXp : 0;

      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const barGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      barGradient.addColorStop(0, '#57F287');
      barGradient.addColorStop(1, '#FEE75C');
      ctx.fillStyle = barGradient;
      ctx.fillRect(barX, barY, barWidth * Math.min(progress, 1), barHeight);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${data.xp} / ${data.neededXp} XP`, barX + barWidth / 2, barY + 22);

      try {
        const avatar = await loadImage(data.avatarUrl);
        ctx.beginPath();
        ctx.arc(75, 100, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, 50, 100, 100);
      } catch {}

      const buffer = canvas.toBuffer('image/png');
      parentPort!.postMessage({ success: true, buffer: buffer.toString('base64') });
    } catch (error: any) {
      parentPort!.postMessage({ success: false, error: error.message });
    }
  });
}
