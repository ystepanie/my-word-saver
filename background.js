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
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(text)}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const translated = data[0][0][0]; // 번역된 텍스트
        saveToMarkdown(text, translated);
      })
      .catch(() => {
        // 오류 로그는 최소화하여 조용히 처리하거나 무시
      });
  }
});

// 마크다운 파일로 저장 (데이터 URL 방식)
function saveToMarkdown(original, translated) {
  const content = `- **단어**: ${original}\n- **뜻**: ${translated}\n- **추가일**: ${new Date().toLocaleDateString()}\n\n---\n`;
  const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`;

  chrome.downloads.download({
    url: dataUrl,
    filename: "my_words.md",
    saveAs: false,
  });
}
