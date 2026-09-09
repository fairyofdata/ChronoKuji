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

  return spotMap[luckLevel] || spotMap["吉"] || Object.values(spotMap)[0];
}
