import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
  color: string;
}

interface LightningArc {
  points: { x: number; y: number }[];
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

interface WarpInteractiveCanvasProps {
  onBrake?: (seconds: number) => void;
}

export default function WarpInteractiveCanvas({ onBrake }: WarpInteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onBrakeRef = useRef(onBrake);
  onBrakeRef.current = onBrake;
  const lastBrakeTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    const floatingTexts: FloatingText[] = [];
    const lightningArcs: LightningArc[] = [];
    const colors = ['#38bdf8', '#c084fc', '#facc15', '#34d399', '#f472b6', '#a78bfa'];
    const brakePhrases = [
      '⚡ 회생제동 -3s',
      '⚡ 차원 파동 흡수 -3s',
      '🔋 회생 코일 가동 -3s',
      '🌀 감속 궤도 진입 -3s'
    ];

    // 번개 아크 생성 함수
    const createLightning = (startX: number, startY: number) => {
      for (let j = 0; j < 3; j++) {
        const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
        let currX = startX;
        let currY = startY;
        const angle = Math.random() * Math.PI * 2;
        const length = 35 + Math.random() * 45;
        const steps = 4;
        const stepDist = length / steps;

        for (let s = 1; s <= steps; s++) {
          const jitterX = (Math.random() - 0.5) * 16;
          const jitterY = (Math.random() - 0.5) * 16;
          currX += Math.cos(angle) * stepDist + jitterX;
          currY += Math.sin(angle) * stepDist + jitterY;
          points.push({ x: currX, y: currY });
        }

        lightningArcs.push({
          points,
          alpha: 1,
          life: 0,
          maxLife: 10 + Math.random() * 8,
          color: Math.random() > 0.5 ? '#38bdf8' : '#e0e7ff'
        });
      }
    };

    // 회생제동 시공간 파동 발생
    const triggerRegenerativeBrake = (x: number, y: number) => {
      // 1. 회생제동 충격파 링
      ripples.push({
        x,
        y,
        radius: 8,
        maxRadius: 110 + Math.random() * 40,
        alpha: 0.9,
        color: '#38bdf8'
      });
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: 80 + Math.random() * 30,
        alpha: 0.7,
        color: '#facc15'
      });

      // 2. 고에너지 방전 파티클
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: 30 + Math.random() * 20
        });
      }

      // 3. 전기 아크 효과
      createLightning(x, y);

      // 4. 플로팅 회생제동 텍스트
      const phrase = brakePhrases[Math.floor(Math.random() * brakePhrases.length)];
      floatingTexts.push({
        x,
        y: y - 10,
        text: phrase,
        alpha: 1,
        scale: 0.9,
        life: 0,
        maxLife: 40,
        color: '#38bdf8'
      });

      // 5. 회생제동 콜백 트리거 (200ms 디바운스 보호)
      const now = Date.now();
      if (now - lastBrakeTimeRef.current >= 180) {
        lastBrakeTimeRef.current = now;
        onBrakeRef.current?.(3);
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      triggerRegenerativeBrake(clientX - rect.left, clientY - rect.top);
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });

    // 렌더링 루프
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. 번개 아크 렌더링
      for (let i = lightningArcs.length - 1; i >= 0; i--) {
        const arc = lightningArcs[i];
        arc.life++;
        arc.alpha = 1 - arc.life / arc.maxLife;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(arc.points[0].x, arc.points[0].y);
        for (let p = 1; p < arc.points.length; p++) {
          ctx.lineTo(arc.points[p].x, arc.points[p].y);
        }
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = Math.max(0, arc.alpha);
        ctx.stroke();
        ctx.restore();

        if (arc.life >= arc.maxLife) {
          lightningArcs.splice(i, 1);
        }
      }

      // 2. 리플 그리기
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3.8;
        r.alpha *= 0.93;

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.lineWidth = 2.2;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        if (r.radius >= r.maxRadius || r.alpha <= 0.02) {
          ripples.splice(i, 1);
        }
      }

      // 3. 파티클 그리기
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // 4. 플로팅 텍스트 그리기
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 1.2;
        ft.life++;
        ft.scale = Math.min(1.15, ft.scale + 0.01);
        ft.alpha = 1 - ft.life / ft.maxLife;

        ctx.save();
        ctx.font = 'bold 13px ui-sans-serif, system-ui, sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.life >= ft.maxLife) {
          floatingTexts.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 w-full h-full pointer-events-auto cursor-pointer select-none"
      title="화면을 탭하여 차원 도약 회생제동을 가동하세요!"
    />
  );
}
