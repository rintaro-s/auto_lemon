// ポップアップのUIを初期化
document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup UI initialized');
  
  // 保存されているデータを確認
  checkStoredData();
  
  // STEP1ボタンのイベントリスナー
  const step1Button = document.getElementById('step1-button');
  if (step1Button) {
    step1Button.addEventListener('click', function() {
      processStep1Data();
    });
  }
  
  // STEP2ボタンのイベントリスナー
  const step2Button = document.getElementById('step2-button');
  if (step2Button) {
    step2Button.addEventListener('click', function() {
      processStep2Data();
    });
  }
  
  // STEP3ボタンのイベントリスナー
  const step3Button = document.getElementById('step3-button');
  if (step3Button) {
    step3Button.addEventListener('click', function() {
      processStep3Data();
    });
  }
  
  // クリアボタンのイベントリスナー
  const clearButton = document.getElementById('clear-data');
  if (clearButton) {
    clearButton.addEventListener('click', function() {
      clearStoredData();
    });
  }
});

// 保存されているデータを確認
function checkStoredData() {
  chrome.storage.local.get(['drillData'], function(result) {
    if (result.drillData) {
      const stepNumber = result.drillData.step;
      const timestamp = result.drillData.timestamp;
      const timeSinceCapture = new Date().getTime() - timestamp;
      const secondsAgo = Math.floor(timeSinceCapture / 1000);
      
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.textContent = `STEP${stepNumber} データが利用可能 (${secondsAgo}秒前に取得)`;
        statusElement.className = 'success';
      }
      
      // 対応するボタンを有効化
      enableButton(`step${stepNumber}-button`);
    } else {
      showStatus('保存されたデータはありません', 'info');
    }
  });
}

// STEP1データを処理
function processStep1Data() {
  showStatus('STEP1データを処理中...', 'info');
  
  // まずコンテンツスクリプトの存在を確認
  ensureContentScriptLoaded(function(success) {
    if (!success) {
      showStatus('コンテンツスクリプトの準備に失敗しました', 'error');
      return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || tabs.length === 0) {
        showStatus('アクティブなタブが見つかりません', 'error');
        return;
      }
      
      try {
        chrome.tabs.sendMessage(tabs[0].id, {action: "handleStep1"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            showStatus(`通信エラー: ${chrome.runtime.lastError.message}`, 'error');
            return;
          }
          
          if (response && response.success) {
            showStatus('STEP1の処理が完了しました', 'success');
          } else {
            const errorMessage = response && response.error ? response.error : '不明なエラー';
            showStatus(`処理失敗: ${errorMessage}`, 'error');
          }
        });
      } catch (error) {
        console.error("Exception during messaging:", error);
        showStatus(`エラー: ${error.message}`, 'error');
      }
    });
  });
}

// STEP2データを処理
function processStep2Data() {
  showStatus('STEP2データを処理中...', 'info');
  
  // まずコンテンツスクリプトの存在を確認
  ensureContentScriptLoaded(function(success) {
    if (!success) {
      showStatus('コンテンツスクリプトの準備に失敗しました', 'error');
      return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || tabs.length === 0) {
        showStatus('アクティブなタブが見つかりません', 'error');
        return;
      }
      
      try {
        chrome.tabs.sendMessage(tabs[0].id, {action: "handleStep2"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            showStatus(`通信エラー: ${chrome.runtime.lastError.message}`, 'error');
            return;
          }
          
          if (response && response.success) {
            showStatus('STEP2の処理が完了しました', 'success');
          } else {
            const errorMessage = response && response.error ? response.error : '不明なエラー';
            showStatus(`処理失敗: ${errorMessage}`, 'error');
          }
        });
      } catch (error) {
        console.error("Exception during messaging:", error);
        showStatus(`エラー: ${error.message}`, 'error');
      }
    });
  });
}

// STEP3データを処理
function processStep3Data() {
  showStatus('STEP3データを処理中...', 'info');
  
  // まずコンテンツスクリプトの存在を確認
  ensureContentScriptLoaded(function(success) {
    if (!success) {
      showStatus('コンテンツスクリプトの準備に失敗しました', 'error');
      return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || tabs.length === 0) {
        showStatus('アクティブなタブが見つかりません', 'error');
        return;
      }
      
      try {
        chrome.tabs.sendMessage(tabs[0].id, {action: "handleStep3"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            showStatus(`通信エラー: ${chrome.runtime.lastError.message}`, 'error');
            return;
          }
          
          if (response && response.success) {
            showStatus('STEP3の処理が完了しました', 'success');
          } else {
            const errorMessage = response && response.error ? response.error : '不明なエラー';
            showStatus(`処理失敗: ${errorMessage}`, 'error');
          }
        });
      } catch (error) {
        console.error("Exception during messaging:", error);
        showStatus(`エラー: ${error.message}`, 'error');
      }
    });
  });
}

// コンテンツスクリプトが読み込まれていることを確認する関数
function ensureContentScriptLoaded(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs || tabs.length === 0) {
      callback(false);
      return;
    }
    
    const tab = tabs[0];
    
    // 現在のタブのURLを確認
    if (!tab.url || !tab.url.includes('nanext.alcnanext.jp')) {
      showStatus('このページではこの機能は使用できません', 'error');
      callback(false);
      return;
    }
    
    // まずpingでコンテンツスクリプトが存在するか確認
    try {
      chrome.tabs.sendMessage(tab.id, {action: "ping"}, function(response) {
        if (chrome.runtime.lastError) {
          console.log("コンテンツスクリプト未検出。挿入します:", chrome.runtime.lastError);
          
          // コンテンツスクリプトを挿入
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
          }).then(() => {
            console.log("コンテンツスクリプト挿入成功");
            // 挿入後に少し待ってから準備完了とする
            setTimeout(() => callback(true), 500);
          }).catch(err => {
            console.error("コンテンツスクリプト挿入エラー:", err);
            showStatus(`コンテンツスクリプトの挿入に失敗: ${err.message}`, 'error');
            callback(false);
          });
        } else {
          console.log("コンテンツスクリプト検出済み");
          callback(true);
        }
      });
    } catch (error) {
      console.error("コンテンツスクリプト検出中のエラー:", error);
      callback(false);
    }
  });
}

// 保存データをクリア
function clearStoredData() {
  chrome.storage.local.remove(['drillData'], function() {
    showStatus('保存データをクリアしました', 'info');
    disableAllStepButtons();
  });
}

// ステータス表示を更新
function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = type || 'info';
  }
}

// 指定されたボタンを有効化
function enableButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.classList.remove('disabled');
  }
}

// 全STEPボタンを無効化
function disableAllStepButtons() {
  ['step1-button', 'step2-button', 'step3-button'].forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.disabled = true;
      button.classList.add('disabled');
    }
  });
}
