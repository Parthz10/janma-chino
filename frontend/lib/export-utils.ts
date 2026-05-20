import { toPng } from 'html-to-image';

export async function exportNodeAsPng(node: HTMLElement, filename = 'janma-chino.png') {
  const dataUrl = await toPng(node, { pixelRatio: 3, backgroundColor: '#08111f' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

