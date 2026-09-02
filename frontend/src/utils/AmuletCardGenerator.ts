import { Spot } from '../types';

interface GenerateAmuletOptions {
  spot: Spot;
  luckLevel: string;
  poem: string;
  overallText: string;
}

/**
 * 1080x1920 해상도의 고품격 '차원 오미쿠지 부적' 포토카드 PNG 이미지를 생성합니다.
 */
export async function generateAmuletCardImage({
  spot,
  luckLevel,
  poem,
  overallText
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

  // 1. 배경 이미지 로드 및 캔버스 채우기
  try {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = resolve; // 로드 실패 시에도 그라데이션으로 폴백
      bgImg.src = spot.bgImage;
    });

    if (bgImg.width > 0) {
      // 비율 유지하며 캔버스 채우기
      const hRatio = canvas.width / bgImg.width;
      const vRatio = canvas.height / bgImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (canvas.width - bgImg.width * ratio) / 2;
      const centerShiftY = (canvas.height - bgImg.height * ratio) / 2;
      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, centerShiftX, centerShiftY, bgImg.width * ratio, bgImg.height * ratio);
    } else {
      // 배경 로드 실패 시 심우주 그라데이션
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

  // 2. 딥 비네트 및 어두운 오버레이
  const vignette = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 3. 황금빛 엠보싱 테두리 프레임
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

  // 내부 얇은 보조선
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.strokeRect(borderWidth + 16, borderWidth + 16, width - (borderWidth + 16) * 2, height - (borderWidth + 16) * 2);

  // 4. 중앙 반투명 글래스 패널
  const panelX = 90;
  const panelY = 160;
  const panelW = width - panelX * 2;
  const panelH = height - 320;

  ctx.fillStyle = 'rgba(10, 6, 20, 0.78)';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // 5. 상단 타이틀
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 28px sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('CHRONO KUJI • 次元神籤', width / 2, panelY + 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(`${spot.locationName}`, width / 2, panelY + 140);

  ctx.fillStyle = '#e9d5ff';
  ctx.font = '600 30px sans-serif';
  ctx.fillText(`[ ${spot.worldName} ]`, width / 2, panelY + 195);

  // 구분선
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, panelY + 230);
  ctx.lineTo(width / 2 + 180, panelY + 230);
  ctx.stroke();

  // 6. 거대한 운명 등급 인장 (Seal)
  const sealY = panelY + 440;
  ctx.save();
  ctx.translate(width / 2, sealY);

  // 인장 박스
  const isGreat = luckLevel === '大吉';
  const sealColor = isGreat ? '#dc2626' : (luckLevel.includes('凶') ? '#581c87' : '#d97706');
  const sealBg = isGreat ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)';

  ctx.fillStyle = sealBg;
  ctx.fillRect(-130, -130, 260, 260);
  ctx.strokeStyle = sealColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(-130, -130, 260, 260);

  // 이중 테두리
  ctx.lineWidth = 2;
  ctx.strokeRect(-118, -118, 236, 236);

  ctx.fillStyle = isGreat ? '#ef4444' : (luckLevel.includes('凶') ? '#c084fc' : '#fbbf24');
  ctx.font = '900 130px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(luckLevel, 0, -5);
  ctx.restore();

  // 7. 운세 시구 (Poem)
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'italic bold 36px serif';

  // 시구 자동 줄바꿈
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
      currentY += 54;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(`"${line.trim()}"`, width / 2, currentY);
  }

  // 8. 행운의 아이템 박스
  const itemBoxY = currentY + 70;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(width / 2 - 260, itemBoxY, 520, 110);
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(width / 2 - 260, itemBoxY, 520, 110);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('✨ 幸運의 次元 아이템', width / 2, itemBoxY + 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px sans-serif';
  ctx.fillText(spot.luckyItem, width / 2, itemBoxY + 86);

  // 9. 총운 요약문
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 28px sans-serif';
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

  // 10. 하단 푸터 & URL
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('지금 당신의 차원 점괘를 확인하세요', width / 2, panelY + panelH - 80);

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
