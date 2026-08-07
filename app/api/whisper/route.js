import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const targetLang = formData.get('targetLang') || 'th';

    let demoSegments = [];

    if (targetLang === 'th') {
      // English audio -> Thai translation & sentence segmentation
      demoSegments = [
        {
          id: 1,
          start: 8.93,
          end: 11.24,
          text: "footage never before seen by civilized humanity.",
          translation: "ฟุตเทจที่ไม่เคยเห็นมาก่อนโดยมนุษยชาติที่เจริญแล้ว",
          memo: "문장 1 (태국어)"
        },
        {
          id: 2,
          start: 11.25,
          end: 13.10,
          text: "A lost world in South America,",
          translation: "โลกที่สูญหายในอเมริกาใต้",
          memo: "문장 2 (태국어)"
        },
        {
          id: 3,
          start: 13.11,
          end: 15.54,
          text: "lurking in the shadow of Majestic Paradise Falls",
          translation: "ซ่อนอยู่ในเงาของน้ำตกพาราไดซ์อันยิ่งใหญ่",
          memo: "문장 3 (태국어)"
        },
        {
          id: 4,
          start: 15.55,
          end: 18.87,
          text: "it sports plants and animals undiscovered by science,",
          translation: "มีพืชและสัตว์ที่ยังไม่อาจค้นพบโดยวิทยาศาสตร์",
          memo: "문장 4 (태국어)"
        },
        {
          id: 5,
          start: 18.88,
          end: 21.88,
          text: "Who would dare set foot on this inhospitable summit?",
          translation: "ใครจะกล้าเหยียบย่างบนยอดเขาที่ไม่น่าอยู่อาศัยนี้?",
          memo: "문장 5 (태국어)"
        }
      ];
    } else {
      // Korean translation default
      demoSegments = [
        {
          id: 1,
          start: 8.93,
          end: 11.24,
          text: "footage never before seen by civilized humanity.",
          translation: "문명사회에서 한 번도 본 적 없는 영상입니다.",
          memo: "핵심 도입 문장"
        },
        {
          id: 2,
          start: 11.25,
          end: 13.10,
          text: "A lost world in South America,",
          translation: "남미에 잃어버린 세계가 존재합니다,",
          memo: "장소 설명"
        },
        {
          id: 3,
          start: 13.11,
          end: 15.54,
          text: "lurking in the shadow of Majestic Paradise Falls",
          translation: "장엄한 파라다이스 폭포의 그림자 속에 숨어 있습니다.",
          memo: "lurking = 숨어있는"
        },
        {
          id: 4,
          start: 15.55,
          end: 18.87,
          text: "it sports plants and animals undiscovered by science,",
          translation: "과학계에서 아직 발견되지 않은 동식물들이 무성합니다.",
          memo: "sports = 갖추다"
        },
        {
          id: 5,
          start: 18.88,
          end: 21.88,
          text: "Who would dare set foot on this inhospitable summit?",
          translation: "누가 감히 이 살기 어려운 정상에 발을 디딜 수 있을까요?",
          memo: "수사학적 질문"
        }
      ];
    }

    return NextResponse.json({
      success: true,
      filename: file ? file.name : "sample.mp4",
      segments: demoSegments,
      message: "AI 문장 단위 자동 분할 및 타임스탬프 추출이 완료되었습니다."
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
