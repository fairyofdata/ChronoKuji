import re

ITEM_DESCS = {
    'en': {
        1: "A mystical feather imbued with the gentle breeze and freedom of the Kreiden Plains.",
        2: "A wondrous capsule holding the promise of fateful encounters and boundless adventure.",
        3: "A wooden talisman imbued with purifying vapors and restorative herbal springs.",
        4: "A high-grade cyberware chip pushing neural reflexes past human limitations.",
        5: "A cold, jovial pint of Duff to wash away the burdens of another hectic day.",
        6: "A pink snack box packed with pure childhood wonder and sweet nostalgic delight.",
        7: "An ancient parchment grimoire inscribed with timeless magical wisdom.",
        8: "A vital draught that restores stamina and kindles the spark of a beginner's journey.",
        9: "An unexpected yet trusty implement that stirs courage and resolute determination.",
        10: "A warm, fluffy morsel that melts the bitter frost of the Howling Abyss.",
        11: "A dazzling winged sphere whose capture bestows instant glory and triumph.",
        12: "A ticking artifact proving that gravity and boundless love can bridge any spacetime gulf."
    },
    'ko': {
        1: "크라이덴 평원의 산들바람과 자유가 깃든 신비로운 깃털",
        2: "새로운 만남과 모험의 가능성이 담긴 캡슐",
        3: "온천장의 신비로운 효능과 정화의 기운이 깃든 나무 팻말",
        4: "한계를 뛰어넘는 반사신경과 사이버웨어 칩",
        5: "하루의 피로를 털어내는 유쾌하고 시원한 맥주 한 잔",
        6: "순수한 동심과 달콤한 즐거움이 가득한 핑크빛 과자 상자",
        7: "유구한 시간과 마법의 지혜가 기록된 양피지 마도서",
        8: "모험의 첫 발걸음과 원기를 회복시켜주는 물약",
        9: "단단한 결단력과 용기를 북돋워 주는 만능 무기",
        10: "혹한의 칼바람 속에서도 마음을 따스하게 녹이는 푹신한 간식",
        11: "잡는 순간 승리를 가져다주는 황금빛 마법 날개의 스니치",
        12: "중력과 사랑이 시공간을 초월함을 증명하는 초침의 시계"
    },
    'ja': {
        1: "クライデン平原のそよ風と自由が宿る神秘の羽。",
        2: "新たな出会いと冒険の可能性を秘めたカプセル。",
        3: "湯屋の神秘的な霊効と浄化の気が宿る木札。",
        4: "限界を超える反射神経を授けるサイバーウェアチップ。",
        5: "一日の疲れを吹き飛ばす、陽気で爽快なビールジョッキ。",
        6: "純真な童心と甘い喜びに満ちたピンク色のお菓子箱。",
        7: "悠久の時と魔法の知恵が記された羊皮紙の魔導書。",
        8: "冒険の第一歩と元気を回復させる初心者の秘薬。",
        9: "揺るぎない決意と勇気を奮い立たせる万能のフライパン。",
        10: "極寒の吹雪の中でも心を温かく解きほぐすふわふわのスナック。",
        11: "手にした瞬間に栄光をもたらす黄金の翼を持つスニッチ。",
        12: "重力と愛が時空を超えることを証明する針を刻む腕時計。"
    }
}

file_path = 'frontend/src/i18n/translations.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For each language section, inject itemDesc before desc
for lang in ['en', 'ko', 'ja']:
    for spot_id in range(1, 13):
        desc_text = ITEM_DESCS[lang][spot_id]
        # Look for the luckyItem in that spot block
        # Pattern: in that section, replace luckyItem: '...' with luckyItem: '...', itemDesc: '...'
        pass

# We can regex replace line by line:
# For each spot block:
# luckyItem: '...',
# desc: '...'
# ->
# luckyItem: '...',
# itemDesc: '...',
# desc: '...'

def add_item_descs(text):
    lines = text.split('\n')
    new_lines = []
    current_lang = None
    current_spot = None
    
    for line in lines:
        if line.strip().startswith('en: {'):
            current_lang = 'en'
        elif line.strip().startswith('ko: {'):
            current_lang = 'ko'
        elif line.strip().startswith('ja: {'):
            current_lang = 'ja'
            
        m = re.match(r'^\s*(\d+):\s*\{', line)
        if m:
            current_spot = int(m.group(1))
            
        new_lines.append(line)
        
        if current_lang and current_spot and "luckyItem:" in line:
            indent = line[:len(line) - len(line.lstrip())]
            item_desc = ITEM_DESCS[current_lang][current_spot]
            new_lines.append(f"{indent}itemDesc: '{item_desc}',")
            
    return '\n'.join(new_lines)

updated_content = add_item_descs(content)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("translations.ts updated successfully with itemDesc!")
