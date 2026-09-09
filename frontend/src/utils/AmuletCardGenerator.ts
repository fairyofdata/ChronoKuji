import { Spot } from '../types';
import { SpotTranslation, Language } from '../i18n/types';

interface GenerateAmuletOptions {
  spot: Spot;
  luckLevel: string;
  poem: string;
  overallText: string;
  language?: Language;
  spotInfo?: SpotTranslation;
}

/**
 * Generates a high-definition 1080x1920 (9:16) PNG Amulet Photocard
 * fully localized in English, Japanese, or Korean.
 */
export async function generateAmuletCardImage({
  spot,
  luckLevel,
  poem,
  overallText,
  language = 'en',
  spotInfo
}: GenerateAmuletOptions): Promise<Blob> {
  const width = 1080;
  const height = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const locationName = spotInfo?.locationName || spot.locationName;
  const worldName = spotInfo?.worldName || spot.worldName;
  const luckyItem = spotInfo?.luckyItem || spot.luckyItem;

  const headerTitle = language === 'en' 
    ? 'CHRONO KUJI • MULTIVERSE OMIKUJI' 
    : language === 'ja' 
    ? 'CHRONO KUJI • 次元神籤' 
    : 'CHRONO KUJI • 차원 신초';

  const itemBoxTitle = language === 'en'
    ? '✨ Lucky Multiverse Item'
    : language === 'ja'
    ? '✨ 幸運の次元アイテム'
    : '✨ 행운의 차원 아이템';

  const footerPrompt = language === 'en'
    ? 'Check your spacetime fortune now'
    : language === 'ja'
    ? '今すぐあなたの次元神籤を引こう'
    : '지금 당신의 차원 점괘를 확인하세요';

  // 1. Background image load & fill
  try {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      bgImg.onload = resolve;
      bgImg.onerror = resolve; // Graceful fallback
      bgImg.src = spot.bgImage;
    });

    if (bgImg.width > 0) {
      const hRatio = canvas.width / bgImg.width;
      const vRatio = canvas.height / bgImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (canvas.width - bgImg.width * ratio) / 2;
      const centerShiftY = (canvas.height - bgImg.height * ratio) / 2;
      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, centerShiftX, centerShiftY, bgImg.width * ratio, bgImg.height * ratio);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#090514');
      grad.addColorStop(0.5, '#1e0836');
      grad.addColorStop(1, '#05020a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  } catch {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090514');
    grad.addColorStop(1, '#05020a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Deep vignette and dark atmosphere overlay
  const vignette = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 3. Golden embossed ornamental frame
  const borderWidth = 32;
  const goldGrad = ctx.createLinearGradient(0, 0, width, height);
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.25, '#ca8a04');
  goldGrad.addColorStop(0.5, '#fef9c3');
  goldGrad.addColorStop(0.75, '#a16207');
  goldGrad.addColorStop(1, '#fde047');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 12;
  ctx.strokeRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2);

  // Inner subtle accent line
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.strokeRect(borderWidth + 16, borderWidth + 16, width - (borderWidth + 16) * 2, height - (borderWidth + 16) * 2);

  // 4. Central translucent glass panel
  const panelX = 90;
  const panelY = 160;
  const panelW = width - panelX * 2;
  const panelH = height - 320;

  ctx.fillStyle = 'rgba(10, 6, 20, 0.78)';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // 5. Header title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 28px sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText(headerTitle, width / 2, panelY + 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(locationName, width / 2, panelY + 140);

  ctx.fillStyle = '#e9d5ff';
  ctx.font = '600 30px sans-serif';
  ctx.fillText(`[ ${worldName} ]`, width / 2, panelY + 195);

  // Divider
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, panelY + 230);
  ctx.lineTo(width / 2 + 180, panelY + 230);
  ctx.stroke();

  // 6. Giant Fortune Rank Seal (Inshou)
  const sealY = panelY + 440;
  ctx.save();
  ctx.translate(width / 2, sealY);

  const isGreat = luckLevel === '大吉';
  const sealColor = isGreat ? '#dc2626' : (luckLevel.includes('凶') ? '#581c87' : '#d97706');
  const sealBg = isGreat ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)';

  ctx.fillStyle = sealBg;
  ctx.fillRect(-130, -130, 260, 260);
  ctx.strokeStyle = sealColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(-130, -130, 260, 260);

  // Double border
  ctx.lineWidth = 2;
  ctx.strokeRect(-118, -118, 236, 236);

  ctx.fillStyle = isGreat ? '#ef4444' : (luckLevel.includes('凶') ? '#c084fc' : '#fbbf24');
  ctx.font = '900 130px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(luckLevel, 0, -5);
  ctx.restore();

  // 7. Fortune Poem Verse
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'italic bold 34px serif';

  const maxPoemWidth = panelW - 120;
  const words = poem.split(' ');
  let line = '';
  let currentY = panelY + 670;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxPoemWidth && n > 0) {
      ctx.fillText(`"${line.trim()}"`, width / 2, currentY);
      line = words[n] + ' ';
      currentY += 52;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(`"${line.trim()}"`, width / 2, currentY);
  }

  // 8. Lucky Item Box
  const itemBoxY = currentY + 70;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(width / 2 - 270, itemBoxY, 540, 110);
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(width / 2 - 270, itemBoxY, 540, 110);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(itemBoxTitle, width / 2, itemBoxY + 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px sans-serif';
  ctx.fillText(luckyItem, width / 2, itemBoxY + 86);

  // 9. Overall Summary
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 27px sans-serif';
  const textWords = overallText.split(' ');
  let textLine = '';
  let textY = itemBoxY + 180;
  const maxTextLines = 3;
  let lineCount = 0;

  for (let n = 0; n < textWords.length; n++) {
    const testLine = textLine + textWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxPoemWidth && n > 0) {
      ctx.fillText(textLine.trim(), width / 2, textY);
      textLine = textWords[n] + ' ';
      textY += 46;
      lineCount++;
      if (lineCount >= maxTextLines) break;
    } else {
      textLine = testLine;
    }
  }
  if (textLine.trim() && lineCount < maxTextLines) {
    ctx.fillText(textLine.trim(), width / 2, textY);
  }

  // 10. Footer Prompt & Link
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(footerPrompt, width / 2, panelY + panelH - 80);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 32px monospace';
  ctx.fillText('https://chronokuji.web.app', width / 2, panelY + panelH - 35);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create card image blob'));
    }, 'image/png');
  });
}
