try {
  importScripts("config.js");
} catch (e) {
  console.error(
    "Failed to load config.js. Make sure to create it with WEB_APP_URL.",
  );
}

// 우클릭 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "saveWord",
      title: "단어장에 저장하기: '%s'",
      contexts: ["selection"],
    });
  });
});

// 메뉴 클릭 시 실행
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord") {
    const text = info.selectionText;
    const date = new Date().toLocaleDateString();

    // 1. 구글 번역 API 호출
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(text)}`;

    fetch(translateUrl)
      .then((response) => response.json())
      .then((data) => {
        const translated = data[0][0][0]; // 번역된 텍스트

        // 2. 구글 시트로 데이터 전송 (추가됨!)
        fetch(WEB_APP_URL, {
          method: "POST",
          mode: "no-cors", // 구글 앱스 스크립트 특성상 no-cors가 안정적일 때가 많습니다.
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            original: text,
            translated: translated,
            date: date,
          }),
        });
      });
  }
});
