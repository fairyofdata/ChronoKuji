import { WorldFortune, WORLD_OMIKUJI_LORE_KO } from './omikujiLoreKo';
import { WORLD_OMIKUJI_LORE_EN } from './omikujiLoreEn';
import { WORLD_OMIKUJI_LORE_JA } from './omikujiLoreJa';

export type { WorldFortune };
export { WORLD_OMIKUJI_LORE_KO, WORLD_OMIKUJI_LORE_EN, WORLD_OMIKUJI_LORE_JA };

// Default backward compatibility
export const WORLD_OMIKUJI_LORE = WORLD_OMIKUJI_LORE_KO;

/**
 * Retrieves the localized fortune text, poem, and category predictions
 * for a specific dimensional spot, luck grade, and language (en, ko, ja).
 */
export function getSpacetimeFortune(
  spotId: number,
  luckLevel: string,
  lang: 'ko' | 'en' | 'ja' = 'en'
): WorldFortune | undefined {
  let table: Record<number | string, Record<string, WorldFortune>> = WORLD_OMIKUJI_LORE_EN;
  if (lang === 'ko') {
    table = WORLD_OMIKUJI_LORE_KO;
  } else if (lang === 'ja') {
    table = WORLD_OMIKUJI_LORE_JA;
  }

  const spotMap = table[spotId] || table[String(spotId)] || table[2] || table["2"];
  if (!spotMap) return undefined;

  // 정통 한자 등급 정규화 맵 (한글/오타 완벽 대응)
  const normalizedGradeMap: Record<string, string> = {
    '대길': '大吉', 'Great Blessing': '大吉',
    '중길': '中吉', 'Middle Blessing': '中吉',
    '소길': '小吉', 'Small Blessing': '小吉',
    '길': '吉', 'Blessing': '吉',
    '말길': '末吉', 'Future Blessing': '末吉',
    '흉': '凶', 'Misfortune': '凶',
    '대흉': '大凶', '大흉': '大凶', '대凶': '大凶', 'Great Misfortune': '大凶'
  };

  const lookupKey = normalizedGradeMap[luckLevel] || luckLevel;

  const fortune = spotMap[lookupKey] || 
    spotMap[luckLevel] || 
    (luckLevel === '大凶' ? spotMap['대흉'] : (luckLevel === '대흉' ? spotMap['大凶'] : undefined)) || 
    spotMap["吉"] || 
    Object.values(spotMap)[0];

  return fortune;
}
