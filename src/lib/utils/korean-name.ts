// 한글 이름의 마지막 글자에 받침이 있는지 판정한다.
// 한글 완성형: 0xAC00~0xD7A3. (code - 0xAC00) % 28 !== 0 이면 종성(받침)이 있다.
function hasFinalConsonant(name: string): boolean {
  const last = name.trim().slice(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

// 시나리오 텍스트의 {childName}과 한국어 조사 패턴을 실제 이름에 맞게 치환한다.
// 지원 패턴:
//   {childName}(이)는/가/의/도/를/만     받침 O → "이"+조사, 받침 X → 조사만
//   {childName}(이)와                    받침 O → "과", 받침 X → "와"
//   {childName}이(가)                    받침 O → "이", 받침 X → "가"
//   {childName}은(는) / {childName}을(를) 등 일반 조사 토글도 함께 처리
//   {childName}(아)                      받침 O → "아", 받침 X → "야"
export function replaceChildName(text: string, childName: string): string {
  const final = hasFinalConsonant(childName);

  let result = text.replace(/\{childName\}|\{name\}/g, childName);

  // "이름(이)와" → "이름과" (받침 O) / "이름와" (받침 X)
  result = result.replace(/\(이\)와/g, final ? "과" : "와");
  // "이름(이)랑" → 받침 O "이랑", 받침 X "랑"
  result = result.replace(/\(이\)랑/g, final ? "이랑" : "랑");
  // "이름(이)<조사>" 형태 — 받침 있으면 "이"+조사, 없으면 조사만
  result = result.replace(/\(이\)([는가의도를만])/g, final ? "이$1" : "$1");
  // 문장 끝 등 단독 "(이)"
  result = result.replace(/\(이\)/g, final ? "이" : "");

  // "이름이(가)" 형태
  result = result.replace(/이\(가\)/g, final ? "이" : "가");
  result = result.replace(/가\(이\)/g, final ? "이" : "가");

  // 일반 조사 토글: "은(는)", "는(은)", "을(를)", "를(을)", "과(와)", "와(과)"
  result = result.replace(/은\(는\)/g, final ? "은" : "는");
  result = result.replace(/는\(은\)/g, final ? "은" : "는");
  result = result.replace(/을\(를\)/g, final ? "을" : "를");
  result = result.replace(/를\(을\)/g, final ? "을" : "를");
  result = result.replace(/과\(와\)/g, final ? "과" : "와");
  result = result.replace(/와\(과\)/g, final ? "과" : "와");

  // 호격 "(아)" → 받침 O "아", 받침 X "야"
  result = result.replace(/\(아\)/g, final ? "아" : "야");
  result = result.replace(/\(야\)/g, final ? "아" : "야");

  return result;
}
