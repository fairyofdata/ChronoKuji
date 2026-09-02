import { Spot, SystemAudioTracks, CodexItem } from './types';

export const SYSTEM_AUDIO_TRACKS: SystemAudioTracks = {
  lobby: {
    bgm: '/assets/audio/bgm/chrono_wind_scene.mp3',
    youtubeId: 'ESqZbKPMu00',
    title: 'Chrono Trigger - Wind Scene (600 A.D. / 바람의 동경)'
  },
  travel: {
    bgm: '/assets/audio/bgm/chrono_corridors_of_time.mp3',
    youtubeId: 'UKCWgkJCU3o',
    title: 'Chrono Trigger - Corridors of Time (12000 B.C. / 시간의 회랑)'
  },
  celebrationRapunzel: {
    bgm: '/assets/audio/bgm/extra/tangled_kingdom_dance.mp3',
    youtubeId: '1vX78f6T4eI',
    title: 'Tangled - Kingdom Dance'
  },
  // 메이플스토리 이스터에그 트랙 보존
  easterEggs: {
    mapleRift: {
      bgm: '/assets/audio/bgm/lobby_rift.mp3',
      youtubeId: 'q1Z_7e_qL-g',
      title: 'MapleStory - 차원의 균열'
    },
    mapleTimePath: {
      bgm: '/assets/audio/bgm/traveling_time_path.mp3',
      youtubeId: 'nE0qGv1qY8A',
      title: 'MapleStory - 시간의 길'
    }
  }
};

export const SPOTS: Spot[] = [
  {
    id: 2,
    name: "물풍경 도개교 (포켓몬스터)",
    locationName: "물풍경 도개교",
    worldName: "포켓몬스터",
    shortName: "물풍경 도개교",
    theme: 'bg-gradient-to-br from-sky-600 via-cyan-800 to-slate-900',
    bgImage: '/assets/worlds/spot_2_pokemon.jpg',
    boxImage: '/assets/boxes/box_2_pokemon.jpg',
    itemImage: '/assets/items/item_2_monsterball.jpg',
    luckyItem: '몬스터볼',
    bgm: '/assets/audio/bgm/spot_2_pokemon.mp3',
    youtubeId: 'DHhmXnd_2x4',
    bgmTitle: 'Pokémon B&W - Driftveil City'
  },
  {
    id: 11,
    name: "호그와트 연회장 (해리 포터)",
    locationName: "호그와트 연회장",
    worldName: "해리 포터",
    shortName: "호그와트 연회장",
    theme: 'bg-gradient-to-br from-amber-800 via-stone-900 to-indigo-950',
    bgImage: '/assets/worlds/spot_11_harrypotter.jpg',
    boxImage: '/assets/boxes/box_11_harrypotter.jpg',
    itemImage: '/assets/items/item_11_goldensnitch.jpg',
    luckyItem: '골든 스니치',
    bgm: '/assets/audio/bgm/spot_11_harrypotter.mp3',
    youtubeId: 'wtH-hdOF1uA',
    bgmTitle: 'Harry Potter - Hedwig\'s Theme'
  },
  {
    id: 3,
    name: "온천장 아부라야 (센과 치히로)",
    locationName: "온천장 아부라야",
    worldName: "센과 치히로",
    shortName: "온천장 아부라야",
    theme: 'bg-gradient-to-br from-red-900 via-stone-900 to-indigo-950',
    bgImage: '/assets/worlds/spot_3_bathhouse.jpg',
    boxImage: '/assets/boxes/box_3_bathhouse.jpg',
    itemImage: '/assets/items/item_3_bathtag.jpg',
    luckyItem: '약탕패',
    bgm: '/assets/audio/bgm/spot_3_bathhouse.mp3',
    youtubeId: '2e08wJq2W2w',
    bgmTitle: 'Spirited Away - The Sixth Station'
  },
  {
    id: 6,
    name: "떡잎마을 놀이터 (크레용 신짱)",
    locationName: "떡잎마을 놀이터",
    worldName: "크레용 신짱",
    shortName: "떡잎마을 놀이터",
    theme: 'bg-gradient-to-br from-pink-800 via-amber-900 to-slate-900',
    bgImage: '/assets/worlds/spot_6_shinchan.jpg',
    boxImage: '/assets/boxes/box_6_shinchan.jpg',
    itemImage: '/assets/items/item_6_chocobi.jpg',
    luckyItem: '초코비',
    bgm: '/assets/audio/bgm/spot_6_shinchan.mp3',
    youtubeId: 'W4Wq0oP5hH4',
    bgmTitle: 'Crayon Shin-chan - Nostalgia Piano'
  },
  {
    id: 8,
    name: "리스항구 잡화상점 (메이플스토리)",
    locationName: "리스항구 잡화상점",
    worldName: "메이플스토리",
    shortName: "리스항구 잡화상점",
    theme: 'bg-gradient-to-br from-sky-500 via-emerald-600 to-cyan-800',
    bgImage: '/assets/worlds/spot_8_maplestory.jpg',
    boxImage: '/assets/boxes/box_8_maplestory.jpg',
    itemImage: '/assets/items/item_8_potion.jpg',
    luckyItem: '빨간 포션',
    bgm: '/assets/audio/bgm/spot_8_maplestory.mp3',
    youtubeId: 'd7L1tq4u2Zk',
    bgmTitle: 'MapleStory - Lith Harbor'
  },
  {
    id: 9,
    name: "등불 축제 호숫가 (라푼젤)",
    locationName: "등불 축제 호숫가",
    worldName: "라푼젤",
    shortName: "등불 축제 호숫가",
    theme: 'bg-gradient-to-br from-amber-600 via-purple-800 to-indigo-950',
    bgImage: '/assets/worlds/spot_9_rapunzel.jpg',
    boxImage: '/assets/boxes/box_9_rapunzel.jpg',
    itemImage: '/assets/items/item_9_fryingpan.jpg',
    luckyItem: '마법의 프라이팬',
    bgm: '/assets/audio/bgm/spot_9_rapunzel.mp3',
    youtubeId: 'fKPK6c09WCg',
    bgmTitle: 'Tangled - I See the Light (Instrumental)'
  },
  {
    id: 10,
    name: "칼바람 나락 (리그 오브 레전드)",
    locationName: "칼바람 나락",
    worldName: "리그 오브 레전드",
    shortName: "칼바람 나락",
    theme: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950',
    bgImage: '/assets/worlds/spot_10_howlingabyss.jpg',
    boxImage: '/assets/boxes/box_10_howlingabyss.jpg',
    itemImage: '/assets/items/item_10_porosnax.jpg',
    luckyItem: '포로 간식',
    bgm: '/assets/audio/bgm/spot_10_howlingabyss.mp3',
    youtubeId: 'rB6Y1N5mZ9Y',
    bgmTitle: 'League of Legends - Freljord'
  },
  {
    id: 5,
    name: "모의 선술집 (심슨 가족)",
    locationName: "모의 선술집",
    worldName: "심슨 가족",
    shortName: "모의 선술집",
    theme: 'bg-gradient-to-br from-yellow-700 via-amber-900 to-stone-900',
    bgImage: '/assets/worlds/spot_5_simpsons.jpg',
    boxImage: '/assets/boxes/box_5_simpsons.jpg',
    itemImage: '/assets/items/item_5_beer.jpg',
    luckyItem: '더프 맥주',
    bgm: '/assets/audio/bgm/spot_5_simpsons.mp3',
    youtubeId: 'Xqog63KOANc',
    bgmTitle: 'The Simpsons - Main Theme'
  },
  {
    id: 4,
    name: "애프터라이프 (사이버펑크 2077)",
    locationName: "애프터라이프",
    worldName: "사이버펑크 2077",
    shortName: "애프터라이프",
    theme: 'bg-gradient-to-br from-fuchsia-900 via-black to-cyan-950',
    bgImage: '/assets/worlds/spot_4_cyberpunk.jpg',
    boxImage: '/assets/boxes/box_4_cyberpunk.jpg',
    itemImage: '/assets/items/item_4_neuralchip.jpg',
    luckyItem: '신경 가속기',
    bgm: '/assets/audio/bgm/spot_4_cyberpunk.mp3',
    youtubeId: 'KvMY1uzSC1E',
    bgmTitle: 'Edgerunners - I Really Want to Stay at Your House'
  },
  {
    id: 7,
    name: "오이서스트 시험장 (장송의 프리렌)",
    locationName: "오이서스트 시험장",
    worldName: "장송의 프리렌",
    shortName: "오이서스트 시험장",
    theme: 'bg-gradient-to-br from-indigo-800 via-purple-900 to-slate-950',
    bgImage: '/assets/worlds/spot_7_frieren.jpg',
    boxImage: '/assets/boxes/box_7_frieren.jpg',
    itemImage: '/assets/items/item_7_grimoire.jpg',
    luckyItem: '고대 마도서',
    bgm: '/assets/audio/bgm/spot_7_frieren.mp3',
    youtubeId: 'L2V1Z90kQ8w',
    bgmTitle: 'Frieren - Time Flows Ever Onward'
  },
  {
    id: 1,
    name: "크라이덴 평원 (테일즈위버)",
    locationName: "크라이덴 평원",
    worldName: "테일즈위버",
    shortName: "크라이덴 평원",
    theme: 'bg-gradient-to-br from-emerald-600 via-lime-800 to-teal-900',
    bgImage: '/assets/worlds/spot_1_talesweaver.jpg',
    boxImage: '/assets/boxes/box_1_kraiden.jpg',
    itemImage: '/assets/items/item_1_windfeather.jpg',
    luckyItem: '바람의 깃털',
    bgm: '/assets/audio/bgm/spot_1_kraiden.mp3',
    youtubeId: 'p9LkWbCqZkY',
    bgmTitle: 'TalesWeaver - Second Run'
  },
  {
    id: 12,
    name: "⭐ [히든] 5차원 테서렉트 (인터스텔라)",
    locationName: "5차원 테서렉트",
    worldName: "인터스텔라",
    shortName: "5차원 테서렉트",
    theme: 'bg-gradient-to-br from-amber-900 via-black to-slate-950',
    bgImage: '/assets/worlds/spot_12_tesseract.jpg',
    boxImage: '/assets/boxes/box_12_tesseract.jpg',
    itemImage: '/assets/items/item_12_quantumwatch.jpg',
    luckyItem: '양자 중력 시계',
    bgm: '/assets/audio/bgm/spot_12_tesseract.mp3',
    youtubeId: 'UDVtMYqUAyw',
    bgmTitle: 'Hans Zimmer - Interstellar Main Theme',
    isHidden: true
  }
];

// 11대 차원 도감 수집 마스터 목록 (인지도 순)
export const CODEX_ITEMS: CodexItem[] = [
  {
    id: 2,
    spotId: 2,
    name: '몬스터볼',
    locationName: '물풍경 도개교',
    worldName: '포켓몬스터',
    image: '/assets/items/item_2_monsterball.jpg',
    desc: '새로운 만남과 모험의 가능성이 담긴 캡슐'
  },
  {
    id: 11,
    spotId: 11,
    name: '골든 스니치',
    locationName: '호그와트 연회장',
    worldName: '해리 포터',
    image: '/assets/items/item_11_goldensnitch.jpg',
    desc: '잡는 순간 승리를 가져다주는 황금빛 마법 날개의 스니치'
  },
  {
    id: 3,
    spotId: 3,
    name: '약탕패',
    locationName: '온천장 아부라야',
    worldName: '센과 치히로',
    image: '/assets/items/item_3_bathtag.jpg',
    desc: '온천장의 신비로운 효능과 정화의 기운이 깃든 나무 팻말'
  },
  {
    id: 6,
    spotId: 6,
    name: '초코비',
    locationName: '떡잎마을 놀이터',
    worldName: '크레용 신짱',
    image: '/assets/items/item_6_chocobi.jpg',
    desc: '순수한 동심과 달콤한 즐거움이 가득한 핑크빛 과자 상자'
  },
  {
    id: 8,
    spotId: 8,
    name: '빨간 포션',
    locationName: '리스항구 잡화상점',
    worldName: '메이플스토리',
    image: '/assets/items/item_8_potion.jpg',
    desc: '모험의 첫 발걸음과 원기를 회복시켜주는 물약'
  },
  {
    id: 9,
    spotId: 9,
    name: '마법의 프라이팬',
    locationName: '등불 축제 호숫가',
    worldName: '라푼젤',
    image: '/assets/items/item_9_fryingpan.jpg',
    desc: '단단한 결단력과 용기를 북돋워 주는 만능 무기'
  },
  {
    id: 10,
    spotId: 10,
    name: '포로 간식',
    locationName: '칼바람 나락',
    worldName: '리그 오브 레전드',
    image: '/assets/items/item_10_porosnax.jpg',
    desc: '혹한의 칼바람 속에서도 마음을 따스하게 녹이는 푹신한 간식'
  },
  {
    id: 5,
    spotId: 5,
    name: '더프 맥주',
    locationName: '모의 선술집',
    worldName: '심슨 가족',
    image: '/assets/items/item_5_beer.jpg',
    desc: '하루의 피로를 털어내는 유쾌하고 시원한 맥주 한 잔'
  },
  {
    id: 4,
    spotId: 4,
    name: '신경 가속기',
    locationName: '애프터라이프',
    worldName: '사이버펑크 2077',
    image: '/assets/items/item_4_neuralchip.jpg',
    desc: '한계를 뛰어넘는 반사신경과 사이버웨어 칩'
  },
  {
    id: 7,
    spotId: 7,
    name: '고대 마도서',
    locationName: '오이서스트 시험장',
    worldName: '장송의 프리렌',
    image: '/assets/items/item_7_grimoire.jpg',
    desc: '유구한 시간과 마법의 지혜가 기록된 양피지 마도서'
  },
  {
    id: 1,
    spotId: 1,
    name: '바람의 깃털',
    locationName: '크라이덴 평원',
    worldName: '테일즈위버',
    image: '/assets/items/item_1_windfeather.jpg',
    desc: '크라이덴 평원의 산들바람과 자유가 깃든 신비로운 깃털'
  }
];
