// この変数にステップデータを保存
let storedStepData = null;
let notificationDisplayed = false;

// スクリプトが読み込まれたことをグローバル変数で示す
window.lemonExtensionLoaded = true;

// ページロード時に実行
console.log('Lemon content script loaded:', window.location.href);

// スクリプト読み込み完了を伝える関数
function signalReady() {
  try {
    console.log("コンテンツスクリプト準備完了シグナルを送信");
    chrome.runtime.sendMessage({
      action: "contentScriptReady",
      url: window.location.href,
      timestamp: new Date().getTime()
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.log("準備完了通知エラー（無視可）:", chrome.runtime.lastError.message);
      } else if (response) {
        console.log("準備完了シグナル受信確認:", response);
      }
    });
  } catch (err) {
    console.error("準備完了通知でエラー:", err);
  }
}

// 既存のデータをチェック
function checkForExistingData() {
  try {
    chrome.storage.local.get(['drillData'], function(result) {
      if (result && result.drillData) {
        try {
          const timeSinceCapture = new Date().getTime() - result.drillData.timestamp;
          const secondsAgo = Math.floor(timeSinceCapture / 1000);
          
          storedStepData = result.drillData;
          console.log("STEP" + storedStepData.step + " answer data available (" + secondsAgo + " seconds ago)");
          
          // 通知を表示
          if (!notificationDisplayed) {
            showDataAvailableNotification(storedStepData.step, secondsAgo);
          }
        } catch (err) {
          console.error("保存データの処理でエラー:", err);
        }
      }
    });
  } catch (err) {
    console.error("保存データの取得でエラー:", err);
  }
}

// STEP1のデータを処理する関数
function handleStep1Questions(data) {
  console.log("Processing STEP1 data");
  
  try {
    // 問題領域を検索
    const questionAreas = document.querySelectorAll('.nan-practice-ex-questions');
    if (!questionAreas || questionAreas.length === 0) {
      console.error("Required DOM elements not found: .nan-practice-ex-questions");
      alert("問題要素が見つかりませんでした。正しいページで実行していることを確認してください。");
      return false;
    }

    console.log("Found " + questionAreas.length + " question areas");
    
    // JSONデータから回答を抽出
    if (!data || !data.questions || !Array.isArray(data.questions)) {
      console.error("Invalid data format", data);
      alert("回答データの形式が無効です");
      return false;
    }
    
    // 各問題に対して回答を入力
    let successCount = 0;
    
    data.questions.forEach((question, index) => {
      if (index >= questionAreas.length) return;
      
      try {
        const questionArea = questionAreas[index];
        const questionNumber = index + 1;
        
        // 正解の選択肢を取得
        let correctAnswer = '';
        
        if (question.answer) {
          correctAnswer = question.answer;
        } else if (question.correctAnswer) {
          correctAnswer = question.correctAnswer;
        } else {
          console.warn("No correct answer found for question " + questionNumber);
          return;
        }
        
        // 選択肢を取得し、正解を選択
        const choices = questionArea.querySelectorAll('ol > li > label');
        let selectedChoice = null;
        
        choices.forEach((choice, choiceIndex) => {
          const input = choice.previousElementSibling || 
                      questionArea.querySelector(`input[value="${correctAnswer}"]`);
          
          if (input && input.value === correctAnswer) {
            selectedChoice = choice;
          }
        });
        
        // 選択肢をクリック
        if (selectedChoice && selectedChoice.classList.contains('nan-clickable')) {
          console.log("Clicking choice for question " + questionNumber);
          selectedChoice.click();
          successCount++;
        } else {
          // 従来の方法でのフォールバック
          const radioSelector = 'input[name="normal-choices-1-' + questionNumber + '"][value="' + correctAnswer + '"]';
          const radioButton = questionArea.querySelector(radioSelector);
          
          if (radioButton) {
            console.log("Using fallback method for question " + questionNumber);
            radioButton.checked = true;
            const event = new Event('change', { bubbles: true });
            radioButton.dispatchEvent(event);
            successCount++;
          } else {
            console.warn("Failed to select answer for question " + questionNumber);
          }
        }
      } catch (err) {
        console.error("Question " + (index + 1) + " processing error:", err);
      }
    });
    
    console.log("処理完了: " + successCount + "/" + data.questions.length + " 問に回答");
    return successCount > 0;
  } catch (error) {
    console.error("Error in handleStep1Questions:", error);
    alert("処理中にエラーが発生しました: " + error.message);
    return false;
  }
}

// STEP2のデータを処理する関数
function handleStep2Questions(data) {
  console.log("Processing STEP2 data");
  
  try {
    // 問題領域を検索
    const questionAreas = document.querySelectorAll('.nan-practice-ex-questions');
    if (!questionAreas || questionAreas.length === 0) {
      console.error("Required DOM elements not found: .nan-practice-ex-questions");
      alert("問題要素が見つかりませんでした。正しいページで実行していることを確認してください。");
      return false;
    }

    console.log("Found " + questionAreas.length + " question areas for STEP2");
    
    // JSONデータから回答を抽出
    if (!data || !data.questions || !Array.isArray(data.questions)) {
      console.error("Invalid data format", data);
      alert("回答データの形式が無効です");
      return false;
    }
    
    // 各問題に対して回答を入力
    let successCount = 0;
    
    data.questions.forEach((question, index) => {
      if (index >= questionAreas.length) return;
      
      try {
        const questionArea = questionAreas[index];
        const questionNumber = index + 1;
        
        // 正解の選択肢を取得
        let correctAnswer = '';
        
        if (question.answer) {
          correctAnswer = question.answer;
        } else if (question.correctAnswer) {
          correctAnswer = question.correctAnswer;
        } else {
          console.warn("No correct answer found for question " + questionNumber);
          return;
        }
        
        // 問題内の全ての選択肢を取得
        const labels = questionArea.querySelectorAll('ol > li > label');
        const inputs = questionArea.querySelectorAll('input[type="radio"]');
        let found = false;
        
        // まずはinputの値で直接検索
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].value === correctAnswer) {
            console.log(`Found radio button for question ${questionNumber} by value, selecting ${correctAnswer}`);
            
            // 対応するラベルをクリック
            if (labels[i] && labels[i].classList.contains('nan-clickable')) {
              labels[i].click();
              found = true;
              successCount++;
              break;
            } else {
              // ラベルがクリックできない場合、直接inputに設定
              inputs[i].checked = true;
              inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
              found = true;
              successCount++;
              break;
            }
          }
        }
        
        if (!found) {
          console.warn(`Failed to select answer for STEP2 question ${questionNumber}`);
        }
      } catch (err) {
        console.error("Question " + (index + 1) + " processing error:", err);
      }
    });
    
    console.log("処理完了: " + successCount + "/" + data.questions.length + " 問に回答");
    return successCount > 0;
  } catch (error) {
    console.error("Error in handleStep2Questions:", error);
    alert("処理中にエラーが発生しました: " + error.message);
    return false;
  }
}

// STEP3のデータを処理する関数（誤文訂正問題）- 1問ずつ順次処理
function handleStep3Questions(data) {
  console.log("Processing STEP3 data");
  
  try {
    // JSONデータから回答を抽出
    if (!data || !data.questions || !Array.isArray(data.questions)) {
      console.error("Invalid data format", data);
      alert("回答データの形式が無効です");
      return false;
    }
    
    // 各問題への回答を順次処理するための変数
    let currentQuestionIndex = 0;
    const totalQuestions = data.questions.length;
    
    // 1問ずつ処理する関数
    function processCurrentQuestion() {
      // STEP3は誤文訂正問題なので特定の要素を探す
      const templateTocorrect = document.querySelector('.nan-template-tocorrect');
      if (!templateTocorrect) {
        console.error("Required DOM element not found: .nan-template-tocorrect");
        
        // 別のセレクタでも試してみる
        const alternateContainer = document.querySelector('#ui-id-8 .nan-step-content > div');
        if (alternateContainer) {
          console.log("Found alternative container:", alternateContainer);
          return processWithElement(alternateContainer, currentQuestionIndex);
        }
        
        alert("問題要素が見つかりませんでした。正しいページで実行していることを確認してください。");
        return false;
      }

      // 通常の処理を続行
      return processWithElement(templateTocorrect, currentQuestionIndex);
    }
    
    // 指定された要素を使って処理する関数
    function processWithElement(element, questionIndex) {
      // STEP3の問題番号の要素 - ラベル要素を直接指定
      const questionNoLabel = element.querySelector('.nan-step-question-no label');
      let currentNumber = questionIndex + 1;
      
      if (questionNoLabel) {
        const labelText = questionNoLabel.textContent.trim();
        const parsedNumber = parseInt(labelText, 10);
        if (!isNaN(parsedNumber)) {
          currentNumber = parsedNumber;
          console.log("Found question number from label:", currentNumber);
        }
      } else {
        console.log("Could not find question number label, using index:", currentNumber);
      }
      
      // データ配列の範囲を確認
      if (questionIndex >= totalQuestions) {
        console.log("All STEP3 questions processed successfully!");
        return true;
      }
      
      // 現在の問題の回答情報を取得
      const question = data.questions[questionIndex];
      if (!question) {
        console.error(`Question data not found for index: ${questionIndex}`);
        return false;
      }
      
      console.log("Question data:", question);
      
      // 直接 answer オブジェクトを使う（JSON構造に合わせて最適化）
      let correctChoice = '';
      let correctAnswer = '';
      
      // JSONの構造に基づいてデータを直接取得
      if (question.answer && question.answer.choice) {
        correctChoice = question.answer.choice;
        console.log("Found choice in answer object:", correctChoice);
      }
      
      if (question.answer && question.answer.correct) {
        correctAnswer = question.answer.correct;
        console.log("Found correct answer in answer object:", correctAnswer);
      }
      
      // JSON構造が異なる場合のフォールバック
      if (!correctChoice || !correctAnswer) {
        console.log("Using fallback methods to find answer data");
        
        // 選択肢の取得 - 複数の可能なフィールド名をチェック
        if (question.choice) {
          correctChoice = question.choice;
        } else if (question.incorrectChoice) {
          correctChoice = question.incorrectChoice;
        } else if (question.errorChoice) {
          correctChoice = question.errorChoice;
        } else if (question.errorOption) {
          correctChoice = question.errorOption;
        } else if (question.wrongChoice) {
          correctChoice = question.wrongChoice;
        } else {
          // オブジェクト内のすべてのプロパティを調べる
          for (const key in question) {
            if (typeof question[key] === 'string' && 
                ['a', 'b', 'c', 'A', 'B', 'C'].includes(question[key]) && 
                key.toLowerCase().includes('choice')) {
              console.log(`Found potential choice field: ${key} = ${question[key]}`);
              correctChoice = question[key];
              break;
            }
          }
        }
        
        // 正答の取得 - 複数の可能なフィールド名をチェック
        if (question.answer && typeof question.answer === 'string') {
          correctAnswer = question.answer;
        } else if (question.correctAnswer) {
          correctAnswer = question.correctAnswer;
        } else if (question.correctForm) {
          correctAnswer = question.correctForm;
        } else if (question.correctedWord) {
          correctAnswer = question.correctedWord;
        } else if (question.correct) {
          correctAnswer = question.correct;
        } else {
          // オブジェクト内のすべてのプロパティを調べる
          for (const key in question) {
            if (typeof question[key] === 'string' && 
                (key.toLowerCase().includes('answer') || 
                key.toLowerCase().includes('correct'))) {
              console.log(`Found potential answer field: ${key} = ${question[key]}`);
              correctAnswer = question[key];
              break;
            }
          }
        }
      }
      
      // 選択肢と回答が見つからなかった場合、ページから直接情報を取得する
      if (!correctChoice || !correctAnswer) {
        // まずは問題文を取得
        const japaneseText = element.querySelector('.nan-step-question-sentence-ja');
        const englishText = element.querySelector('.nan-step-question-sentence-en');
        
        if (englishText) {
          // 下線付きのテキストから選択肢を見つける
          const underlinedElements = englishText.querySelectorAll('u');
          for (const el of underlinedElements) {
            const text = el.textContent;
            const choiceMatch = text.match(/\(([A-C])\)/);
            if (choiceMatch && choiceMatch[1]) {
              correctChoice = choiceMatch[1];
              console.log(`Extracted choice from page: ${correctChoice}`);
              break;
            }
          }
          
          // 回答を推測（よくあるエラーパターンから）
          if (!correctAnswer && correctChoice) {
            const choiceIndex = correctChoice.charCodeAt(0) - 65; // A=0, B=1, C=2
            if (underlinedElements && choiceIndex >= 0 && choiceIndex < underlinedElements.length) {
              const underlined = underlinedElements[choiceIndex];
              if (underlined) {
                const errorText = underlined.textContent.replace(/\([A-C]\)\s*/, '').trim();
                console.log(`Found error text: ${errorText}`);
                
                // 一般的な文法エラー修正パターン
                const commonErrors = {
                  'to going': 'going to',
                  'are go': 'are going',
                  'to be go': 'to be going',
                  'having': 'have',
                  'is having': 'has',
                  'are having': 'have',
                  'to be': 'be',
                  'to do': 'do',
                  // 冠詞関連のエラー
                  'moon': 'the moon',
                  'water': 'the water',
                  'girl': 'the girl',
                  'the': 'a',
                  'a Kyoto': 'Kyoto',
                  'a Ken': 'Ken',
                  'a money': 'money',
                  'apple': 'an apple',
                  'piece': 'a piece',
                  'cup': 'a cup'
                };
                
                if (commonErrors[errorText]) {
                  correctAnswer = commonErrors[errorText];
                  console.log(`Guessed correction: ${errorText} -> ${correctAnswer}`);
                }
              }
            }
          }
        }
        
        // 正解の文章から抽出を試みる
        const correctSentence = element.querySelector('.nan-tocorrect-correct-sentence-en');
        if (correctSentence) {
          const correctedSpan = correctSentence.querySelector('[data-nan-corrected]');
          if (correctedSpan) {
            correctAnswer = correctedSpan.textContent.trim();
            console.log(`Extracted answer from corrected sentence: ${correctAnswer}`);
          }
        }
      }
      
      console.log(`Question ${questionIndex + 1}: Choice=${correctChoice}, Answer=${correctAnswer}`);
      
      if (!correctChoice) {
        console.warn("Failed to determine correct choice for question");
        alert("正解の選択肢が見つかりませんでした。開発者に連絡してください。");
        return false;
      }
      
      if (!correctAnswer) {
        console.warn("Failed to determine correct answer for question");
        alert("正解のテキストが見つかりませんでした。開発者に連絡してください。");
        return false;
      }
      
      // 2ステップに分けて処理（選択→入力）
      // ステップ1: まず選択肢を必ず選択してから入力する
      let choiceSelected = selectCorrectChoice(element, correctChoice);
      
      // 選択を待ってから入力処理
      setTimeout(() => {
        if (choiceSelected) {
          // ステップ2: 正しい答えをテキスト入力欄に入力
          enterCorrectAnswer(element, correctAnswer, currentQuestionIndex, totalQuestions);
        } else {
          console.error("Failed to select choice - cannot proceed with answer input");
          alert("選択肢の選択に失敗しました。もう一度試すか、別の方法で解答してください。");
        }
      }, 1000); // 選択と入力の間に1秒待機
      
      return true;
    }
    
    // 選択肢クリック専用の関数 - 選択に集中する
    function selectCorrectChoice(element, correctChoice) {
      console.log("STEP 1: 選択肢を選択します - 選択肢 " + correctChoice);
      let choiceSelected = false;
      
      // 方法1: 直接ラジオボタンを選択
      try {
        const radioSelector = `input[name="choices"][value="${correctChoice}"]`;
        const radioButton = element.querySelector(radioSelector) || document.querySelector(radioSelector);
        
        if (radioButton) {
          console.log(`Found radio button for choice ${correctChoice}, selecting it directly`);
          radioButton.checked = true;
          radioButton.dispatchEvent(new Event('change', { bubbles: true }));
          radioButton.dispatchEvent(new Event('click', { bubbles: true }));
          
          // もしラベルがあれば、そちらもクリック
          const parentLabel = radioButton.closest('label');
          if (parentLabel) {
            parentLabel.click();
          }
          
          choiceSelected = true;
        }
      } catch (err) {
        console.warn("Radio button selection failed:", err);
      }
      
      // 方法2: インデックスに基づいてラベルを選択
      if (!choiceSelected) {
        try {
          console.log("Trying to select by index and label click");
          const choiceIndex = correctChoice.charCodeAt(0) - 65; // A=0, B=1, C=2
          const labels = element.querySelectorAll('.nan-tocorrect-choices ol li label');
          
          if (labels && labels.length > 0 && choiceIndex >= 0 && choiceIndex < labels.length) {
            const label = labels[choiceIndex];
            
            // ラベルと関連するラジオボタンを検出
            const radioInput = label.querySelector('input[type="radio"]') || 
                              document.querySelector(`input[value="${correctChoice}"]`);
            
            if (radioInput) {
              // まずラジオボタンをチェック
              radioInput.checked = true;
              radioInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // 次にラベルをクリック
            label.click();
            
            // クリックイベントを確実に発火させる
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            label.dispatchEvent(clickEvent);
            
            choiceSelected = true;
            console.log(`Selected choice ${correctChoice} by index method`);
          }
        } catch (err) {
          console.warn("Label selection by index failed:", err);
        }
      }
      
      // 方法3: テキスト内容から探す
      if (!choiceSelected) {
        try {
          console.log("Trying to find choice by text content");
          // 選択肢のラベルテキストを探す
          const choiceTexts = element.querySelectorAll('.nan-tocorrect-text');
          const letters = ["A", "B", "C"];
          
          for (let i = 0; i < choiceTexts.length; i++) {
            console.log(`Examining choice ${letters[i]} text: "${choiceTexts[i].textContent}"`);
            
            if (letters[i] === correctChoice) {
              // この選択肢に対応するラベルを見つける
              const parentLabel = choiceTexts[i].closest('label');
              
              if (parentLabel) {
                parentLabel.click();
                console.log(`Clicked label for choice ${correctChoice} by text content`);
                
                // 関連するラジオボタンも選択
                const nearbyRadio = parentLabel.querySelector('input[type="radio"]');
                if (nearbyRadio) {
                  nearbyRadio.checked = true;
                  nearbyRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                choiceSelected = true;
                break;
              }
            }
          }
        } catch (err) {
          console.warn("Text content search failed:", err);
        }
      }
      
      // 最後の方法: スクリプト実行
      if (!choiceSelected) {
        try {
          console.log("Using JavaScript to simulate selection");
          // 直接JavaScriptでラジオボタンの選択状態を操作
          const script = `
            var radios = document.querySelectorAll('input[name="choices"]');
            for (var i = 0; i < radios.length; i++) {
              if (radios[i].value === '${correctChoice}') {
                radios[i].checked = true;
                var event = new Event('change', { bubbles: true });
                radios[i].dispatchEvent(event);
                console.log('Set radio button for ${correctChoice} via script');
                break;
              }
            }
          `;
          
          const scriptEl = document.createElement('script');
          scriptEl.textContent = script;
          document.head.appendChild(scriptEl);
          scriptEl.remove();
          
          choiceSelected = true; // スクリプトが実行されたと仮定
          console.log("Script-based selection attempted");
        } catch (err) {
          console.warn("Script execution failed:", err);
        }
      }
      
      // 選択結果の確認
      setTimeout(() => {
        // 選択されたか確認
        const selectedRadio = document.querySelector(`input[name="choices"]:checked`);
        if (selectedRadio) {
          console.log(`Selection confirmed: choice ${selectedRadio.value} is selected`);
          choiceSelected = true;
        } else {
          console.warn("No radio button appears to be selected");
        }
      }, 500);
      
      return choiceSelected;
    }
    
    // 正解入力専用の関数
    function enterCorrectAnswer(element, correctAnswer, currentIndex, totalQuestions) {
      console.log("STEP 2: テキストエリアに正解を入力します: " + correctAnswer);
      let answerEntered = false;
      
      try {
        // テキストエリアを探す
        const textArea = element.querySelector('.nan-step-tocorrect-textinput-box textarea');
        
        if (textArea) {
          // フォーカスをあてる
          textArea.focus();
          
          // テキストをクリアしてから入力
          textArea.value = '';
          textArea.dispatchEvent(new Event('input', { bubbles: true }));
          
          // 少し待ってから正解を入力
          setTimeout(() => {
            textArea.value = correctAnswer;
            textArea.dispatchEvent(new Event('input', { bubbles: true }));
            textArea.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log("Answer text entered: " + correctAnswer);
            answerEntered = true;
            
            // 少し待ってからANSWERボタンをクリック
            setTimeout(() => {
              clickAnswerButton(element, currentIndex, totalQuestions);
            }, 800);
          }, 200);
        } else {
          console.error("Cannot find textarea for answer input");
        }
      } catch (err) {
        console.error("Error entering answer:", err);
      }
      
      return answerEntered;
    }
    
    // ANSWERとNEXTボタンをクリックする関数
    function clickAnswerButton(element, currentIndex, totalQuestions) {
      console.log("STEP 3: ANSWERボタンをクリックします");
      
      // ANSWERボタンを複数の方法で検索
      const answerButtons = [
        document.querySelector('button[name="onClickAnswer"]'),
        document.querySelector('.nan-button-operation'),
        document.querySelector('.nan-button-answer'),
        document.querySelector('button.ui-button:not(.nan-button-action):not([name="onClickNext"])')
      ];
      
      let answerButton = null;
      for (const btn of answerButtons) {
        if (btn && btn.offsetParent !== null) { // 表示されているかチェック
          answerButton = btn;
          break;
        }
      }
      
      if (answerButton) {
        console.log("ANSWERボタンを発見、クリックします");
        answerButton.click();
        
        // NEXTボタンをクリック（解答後に表示される）
        setTimeout(() => {
          console.log("STEP 4: NEXTボタンをクリックします");
          
          // NEXTボタンを複数の方法で検索
          const nextButtons = [
            document.querySelector('button[name="onClickNext"]'),
            document.querySelector('.nan-button-action:not(.nan-button-answer)'),
            document.querySelector('button.ui-button:not(.nan-button-operation)')
          ];
          
          let nextButton = null;
          for (const btn of nextButtons) {
            if (btn && btn.offsetParent !== null) { // 表示されているかチェック
              nextButton = btn;
              break;
            }
          }
          
          if (nextButton) {
            console.log("NEXTボタンを発見、クリックします");
            nextButton.click();
            
            // 次の問題へ進む
            currentQuestionIndex++;
            
            // まだ処理すべき問題があれば続行
            if (currentQuestionIndex < totalQuestions) {
              setTimeout(processCurrentQuestion, 1500); // 1.5秒後に次の問題を処理
            } else {
              console.log("すべての問題が処理されました！");
            }
          } else {
            console.warn("NEXTボタンが見つかりません");
            // 最終問題の場合はここで終了
            if (currentQuestionIndex < totalQuestions - 1) {
              console.log("NEXTボタンなしで次の問題へ進みます");
              currentQuestionIndex++;
              setTimeout(processCurrentQuestion, 1500);
            }
          }
        }, 1000); // ANSWERクリック後1秒待機
      } else {
        console.error("ANSWERボタンが見つかりません");
      }
    }
    
    // 最初の問題から処理を開始
    return processCurrentQuestion();
  } catch (error) {
    console.error("Error in handleStep3Questions:", error);
    alert("処理中にエラーが発生しました: " + error.message);
    return false;
  }
}

// データが利用可能であることを示す通知をページに表示
function showDataAvailableNotification(step, secondsAgo) {
  try {
    // 既存の通知を削除
    const existingNotification = document.getElementById('lemon-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.id = 'lemon-notification';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    notification.style.cursor = 'pointer';
    notification.innerHTML = "STEP" + step + " answer data available (" + secondsAgo + " seconds ago)";
    
    // クリックイベントを追加
    notification.onclick = function() {
      try {
        if (!storedStepData || !storedStepData.json) {
          alert("解答データが利用できません。再読み込みしてください。");
          return;
        }
        
        let result = false;
        
        if (step === '1') {
          result = handleStep1Questions(storedStepData.json);
        } else if (step === '2') {
          result = handleStep2Questions(storedStepData.json);
        } else if (step === '3') {
          result = handleStep3Questions(storedStepData.json);
        }
        
        if (result) {
          notification.style.backgroundColor = '#2196F3';
          notification.innerHTML = "STEP" + step + " answers applied!";
        }
      } catch (err) {
        console.error("通知クリック処理でエラー:", err);
        alert("処理中にエラーが発生しました: " + err.message);
      }
    };

    document.body.appendChild(notification);
    notificationDisplayed = true;
  } catch (err) {
    console.error("通知表示でエラー:", err);
  }
}

// 初期化関数
function initialize() {
  console.log("コンテンツスクリプト初期化");
  // 既存のデータをチェック
  checkForExistingData();
  // 準備完了を通知
  setTimeout(signalReady, 500);
}

// ページが完全に読み込まれた後に実行
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

// DOMContentLoadedイベントでも試行
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded イベント発火");
  if (!notificationDisplayed) {
    initialize();
  }
});

// バックグラウンドスクリプトからのメッセージを受け取る
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  try {
    console.log("Content script received message:", message);
    
    // ping要求への応答を追加
    if (message.action === "ping") {
      console.log("Ping received, responding with pong");
      sendResponse({ pong: true, status: "content script ready" });
      return true;
    }
    
    if (message.action === "dataAvailable") {
      const secondsAgo = 0; // 新しいデータなので0秒前
      
      // 最新のデータを取得
      chrome.storage.local.get(['drillData'], function(result) {
        try {
          if (result && result.drillData) {
            storedStepData = result.drillData;
            showDataAvailableNotification(message.step || storedStepData.step, secondsAgo);
            sendResponse({ success: true, received: true });
          } else {
            sendResponse({ success: false, error: "No drill data found" });
          }
        } catch (err) {
          console.error("データ表示エラー:", err);
          sendResponse({ success: false, error: err.message });
        }
      });
      
      return true;
    } else if (message.action === "handleStep1") {
      if (storedStepData && storedStepData.json) {
        const result = handleStep1Questions(storedStepData.json);
        sendResponse({ success: result });
      } else {
        sendResponse({ 
          success: false, 
          error: "No data available" 
        });
      }
      return true;
    } else if (message.action === "handleStep2") {
      if (storedStepData && storedStepData.json) {
        const result = handleStep2Questions(storedStepData.json);
        sendResponse({ success: result });
      } else {
        sendResponse({ 
          success: false, 
          error: "No data available" 
        });
      }
      return true;
    } else if (message.action === "handleStep3") {
      if (storedStepData && storedStepData.json) {
        const result = handleStep3Questions(storedStepData.json);
        sendResponse({ success: result });
      } else {
        sendResponse({ 
          success: false, 
          error: "No data available" 
        });
      }
      return true;
    }
    
    sendResponse({ received: true });
    return true;
  } catch (err) {
    console.error("メッセージ処理でエラー:", err);
    sendResponse({ error: err.message });
    return true;
  }
});