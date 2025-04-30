// Network request monitoring
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    // Match URL pattern for drill JSON - 正規表現をより柔軟に調整
    const urlPattern = /https:\/\/nanext\.alcnanext\.jp\/anetn\/course\/materials\/ALC\/GRM\/.*\/drill_step([1-3])\.json/;
    const match = details.url.match(urlPattern);
    
    if (match) {
      try {
        console.log("JSON request detected:", details.url);
        
        // URLパターンから必要な部分を抽出（動的なIDを除去）
        const urlParts = details.url.split('?')[0].split('/');
        const staticUrlPart = urlParts.slice(0, -1).join('/'); // 動的IDを除いたベースURL
        const stepNumber = match[1];
        
        // 重複防止のためのチェック - 同じステップの場合のみスキップ
        const lastProcessedData = await getFromStorage('lastProcessedData');
        if (lastProcessedData && 
            lastProcessedData.staticUrlPart === staticUrlPart && 
            lastProcessedData.step === stepNumber) {
          // 同じステップのデータが既に処理されている場合、一定時間内ならスキップ
          const timeSinceLastProcess = Date.now() - lastProcessedData.timestamp;
          if (timeSinceLastProcess < 5000) { // 5秒以内ならスキップ
            console.log("同一ステップの重複リクエストをスキップ (5秒以内):", stepNumber);
            return;
          }
        }
        
        // Fetch JSON data
        const response = await fetch(details.url);
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        
        const jsonData = await response.json();
        
        console.log("STEP" + stepNumber + " data obtained");
        
        // 処理情報を保存
        await setToStorage('lastProcessedData', {
          staticUrlPart,
          step: stepNumber,
          timestamp: Date.now()
        });
        
        // Save the JSON data
        await setToStorage('drillData', {
          json: jsonData,
          step: stepNumber,
          url: details.url,
          timestamp: Date.now()
        });
        
        // 現在のタブIDを保存（後で使用するため）
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        if (tabs && tabs.length > 0) {
          await setToStorage('activeTabId', tabs[0].id);
        }
        
        // バッジを表示してユーザーに通知
        chrome.action.setBadgeText({ text: stepNumber });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
        
        // 自動的に通知処理を行う - 遅延させてタブの読み込みを待つ
        setTimeout(() => {
          if (tabs && tabs.length > 0) {
            notifyTab(tabs[0].id, {
              json: jsonData,
              step: stepNumber,
              url: details.url,
              timestamp: Date.now()
            });
          }
        }, 1500); // 1.5秒の遅延
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    }
  },
  { urls: ["https://nanext.alcnanext.jp/anetn/course/materials/ALC/GRM/*"] }
);

// タブが更新されたときの処理
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 特定のタブの読み込みが完了したときに処理
  if (changeInfo.status === 'complete' && tab.url && 
      tab.url.includes('nanext.alcnanext.jp')) {
    try {
      // バッジを表示（データがあれば）
      const drillData = await getFromStorage('drillData');
      if (drillData) {
        chrome.action.setBadgeText({ text: drillData.step });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      }
      
      // 保存されたタブIDと一致する場合、メッセージを送信
      const savedTabId = await getFromStorage('activeTabId');
      if (savedTabId === tabId) {
        console.log("タブの読み込みが完了しました。通知を送信します...");
        
        // タイミングの問題を回避するため、少し遅延させて実行
        setTimeout(() => {
          notifyTab(tabId, drillData);
        }, 2000); // 2秒の遅延
      }
    } catch (error) {
      console.error("Tab updated handler error:", error);
    }
  }
});

// 特定のタブにメッセージを送信する関数
async function notifyTab(tabId, drillData) {
  if (!drillData) {
    console.log("通知するデータがありません");
    return;
  }
  
  try {
    console.log("タブID " + tabId + " に通知を送信中...");
    
    // コンテンツスクリプトを挿入
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // コンテンツスクリプトが既に存在するかどうかを確認
        return window.lemonExtensionLoaded === true;
      }
    }).then(async (results) => {
      const scriptExists = results && results[0] && results[0].result === true;
      
      if (!scriptExists) {
        console.log("コンテンツスクリプトを挿入中...");
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
        // 挿入後に少し待つ
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log("コンテンツスクリプトは既に存在します");
      }
      
      // メッセージ送信
      chrome.tabs.sendMessage(
        tabId, 
        { action: "dataAvailable", step: drillData.step },
        response => {
          if (chrome.runtime.lastError) {
            console.log("メッセージ送信エラー (リトライ):", chrome.runtime.lastError.message);
            // リトライ
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tabId, 
                { action: "dataAvailable", step: drillData.step },
                innerResponse => {
                  if (chrome.runtime.lastError) {
                    console.warn("リトライ後もエラー:", chrome.runtime.lastError.message);
                  } else {
                    console.log("リトライ成功:", innerResponse);
                  }
                }
              );
            }, 1500);
          } else {
            console.log("メッセージ送信成功:", response);
          }
        }
      );
    });
  } catch (error) {
    console.error("Notification error:", error);
  }
}

// コンテンツスクリプトが正しく挿入されるように設定
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab && tab.url && tab.url.includes("nanext.alcnanext.jp")) {
      const drillData = await getFromStorage('drillData');
      if (drillData) {
        notifyTab(tab.id, drillData);
      } else {
        console.log("利用可能なデータがありません");
      }
    }
  } catch (error) {
    console.error("アイコンクリックハンドラでエラー:", error);
  }
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message && message.action === "getStepData") {
      // ステップデータの要求に応答
      chrome.storage.local.get(['drillData'], function(result) {
        try {
          if (result && result.drillData && message.step == result.drillData.step) {
            sendResponse({
              success: true,
              data: result.drillData
            });
          } else {
            sendResponse({
              success: false,
              message: "No data available for the requested step"
            });
          }
        } catch (error) {
          console.error("ストレージデータ処理エラー:", error);
          sendResponse({
            success: false,
            error: error.message
          });
        }
      });
      return true; // 非同期応答を示す
    } else if (message && message.action === "contentScriptReady") {
      console.log("コンテンツスクリプトの準備完了:", message.url);
      sendResponse({ received: true });
      
      // コンテンツスクリプトが準備完了したら、データを送信
      getFromStorage('drillData').then(drillData => {
        if (drillData && sender.tab) {
          setTimeout(() => {
            chrome.tabs.sendMessage(
              sender.tab.id,
              { action: "dataAvailable", step: drillData.step },
              response => {
                if (!chrome.runtime.lastError && response) {
                  console.log("準備完了後のメッセージ送信成功:", response);
                }
              }
            );
          }, 500);
        }
      });
      return true;
    }
  } catch (error) {
    console.error("メッセージリスナーでエラー:", error);
  }
  return true;
});

// Installation/update handler
chrome.runtime.onInstalled.addListener(() => {
  console.log("Lemon extension installed");
});

// ストレージ操作のためのヘルパー関数
function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

function setToStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}
