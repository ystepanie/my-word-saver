console.log("서비스 워커 로딩 중...");

// 우클릭 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  console.log("확장 프로그램이 설치/리로드되었습니다.");
  
  // 기존 메뉴를 모두 삭제한 후 새로 생성 (중복 방지)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "saveWord",
      title: "단어장에 저장하기: '%s'",
      contexts: ["selection"]
    });
    console.log("우클릭 메뉴가 생성되었습니다.");
  });
});

// 메뉴 클릭 시 실행
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("메뉴 아이템 클릭됨:", info.menuItemId);
  
  if (info.menuItemId === "saveWord") {
    const text = info.selectionText;
    console.log("선택된 텍스트:", text);
    
    // 구글 번역 API (무료 버전)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(text)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("번역 결과 수신됨:", data);
        const translated = data[0][0][0]; // 번역된 텍스트
        saveToMarkdown(text, translated);
      })
      .catch(error => {
        console.error("번역 중 오류 발생:", error);
      });
  }
});

// 마크다운 파일로 저장 (데이터 URL 방식)
function saveToMarkdown(original, translated) {
  console.log("파일 저장 시도 중...");
  const content = `- **단어**: ${original}\n- **뜻**: ${translated}\n- **추가일**: ${new Date().toLocaleDateString()}\n\n---\n`;
  
  // 한글 깨짐 방지 처리
  const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`;

  chrome.downloads.download({
    url: dataUrl,
    filename: "my_words.md",
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error("다운로드 실패:", chrome.runtime.lastError.message);
    } else {
      console.log("다운로드 완료! ID:", downloadId);
    }
  });
}
