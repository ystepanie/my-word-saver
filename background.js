// 우클릭 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "saveWord",
      title: "단어장에 저장하기: '%s'",
      contexts: ["selection"]
    });
  });
});

// 메뉴 클릭 시 실행
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord") {
    const text = info.selectionText;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(text)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const translated = data[0][0][0]; // 번역된 텍스트
        saveAndDownload(text, translated);
      });
  }
});

// 단어를 브라우저 저장소에 누적하고 파일로 다운로드
async function saveAndDownload(original, translated) {
  // 1. 기존의 단어 목록을 가져옴
  const result = await chrome.storage.local.get(['wordList']);
  const wordList = result.wordList || [];

  // 2. 새로운 단어 추가
  const newEntry = `- **단어**: ${original}\n- **뜻**: ${translated}\n- **추가일**: ${new Date().toLocaleDateString()}\n\n---\n`;
  wordList.push(newEntry);

  // 3. 업데이트된 목록을 다시 저장소에 저장
  await chrome.storage.local.set({ wordList });

  // 4. 모든 단어를 합쳐서 하나의 마크다운 파일로 다운로드 (덮어쓰기 권장)
  const fullContent = wordList.join("");
  const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(fullContent)}`;

  chrome.downloads.download({
    url: dataUrl,
    filename: "my_words.md",
    conflictAction: "overwrite", // 기존 파일을 덮어써서 계속 하나로 유지 시도
    saveAs: false
  });
}
