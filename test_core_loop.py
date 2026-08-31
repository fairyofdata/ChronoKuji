import urllib.request
import urllib.error
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(endpoint, method="POST", headers=None, data=None):
    req = urllib.request.Request(BASE_URL + endpoint, method=method, data=data)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"\n❌ API 에러 발생 ({endpoint}): {e.read().decode('utf-8')}")
        sys.exit(1)

def run_test():
    print("==== 🔮 오미쿠지 코어 루프 테스트 시작 ====\n")
    
    # 1. 게스트 로그인
    print("🚀 [Step 1] 게스트 로그인(UUID 발급) 진행...")
    auth_data = api_call("/users/auth", "POST")
    user_id = auth_data["user_id"]
    print(f"✅ 유저 생성 완료! UUID: {user_id}\n")

    headers = {"x-user-id": user_id, "accept": "application/json"}

    # 2. 스팟 이동 시작 (Spot 1: 테일즈위버)
    print("🚀 [Step 2] '테일즈위버 주점(Spot 1)'으로 이동 시작...")
    move_data = api_call("/movement/start?target_spot_id=1", "POST", headers=headers)
    print(f"✅ 이동 시작! 도착 예정 시간: {move_data['arrival_time']}\n")

    # 3. 타임록 대기 (설정된 1분 대기)
    print("⏳ 타임록 대기 중... (서버의 도착 시간을 기다립니다)")
    for i in range(60, 0, -1):
        sys.stdout.write(f"\r남은 시간: {i}초 ")
        sys.stdout.flush()
        time.sleep(1)
    print("\n\n")

    # 4. 목적지 도착 확인
    print("🚀 [Step 3] 목적지 도착 완료 처리...")
    arrive_data = api_call("/movement/arrive", "POST", headers=headers)
    print(f"✅ 도착 확정! 현재 위치: Spot {arrive_data['current_spot_id']}\n")

    # 5. 오미쿠지 뽑기
    print("🚀 [Step 4] 오미쿠지 점괘 뽑기...")
    omikuji_data = api_call("/omikuji/draw?spot_id=1", "POST", headers=headers)
    print(f"🎉 [결과] {omikuji_data['luck_level']}!")
    print(f"📝 원문: {omikuji_data['original_text']}")
    print(f"🎁 행운의 아이템: {omikuji_data['meta_info'].get('lucky_item', '없음')}\n")

    # 6. LLM 심층 해석 요청
    print("🚀 [Step 5] LLM 심층 해석 요청 중 (약 3~5초 소요)...")
    history_id = omikuji_data["history_id"]
    payload = json.dumps({"user_context": "요즘 개발 프로젝트를 진행하는데 너무 막막하고 힘들어서 위로가 필요해."}).encode('utf-8')
    
    interpret_data = api_call(f"/interpret/{history_id}", "POST", headers=headers, data=payload)
    
    print("✨ [LLM 심층 해석 결과] ✨")
    print(f"📜 제목: {interpret_data['world_concept_title']}")
    print(f"🔮 해석: {interpret_data['interpretation']}")
    print(f"🎁 행운의 아이템: {interpret_data['lucky_item']}")
    print(f"🎵 BGM/연출: {interpret_data['world_bgm_action']}\n")

if __name__ == "__main__":
    run_test()