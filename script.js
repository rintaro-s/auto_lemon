setTimeout(() => {
  // ここに2秒待ってから実行したいコードを書く



// 対象の要素を取得（XPathを使用）
const xpath = "/html/body/div[4]/div[2]/div[2]/div[1]/div/div[2]/div[2]/div/div[2]";
const targetElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

// 画像リンク
const imageUrl = "https://i.pinimg.com/originals/91/9e/7b/919e7bcd01a69653d4d8907c19e8b02c.png";

// 対象要素が存在するか確認
if (targetElement) {
 // 画像要素を作成
 const imgElement = document.createElement("img");
 imgElement.src = imageUrl;
 imgElement.alt = "Background Image";
 imgElement.style.position = "absolute";
 imgElement.style.zIndex = "-1"; // 対象要素の背後に配置
 imgElement.style.width = "100%"; // 親要素に合わせて幅を設定
 imgElement.style.height = "100%"; // 親要素に合わせて高さを設定
 imgElement.style.objectFit = "cover"; // 画像が要素全体を覆うように設定
 imgElement.style.top = "0";
 imgElement.style.left = "0";

 // 対象要素のスタイルを設定（position: relative を設定することで、子要素の absolute 配置の基準にする）
 targetElement.style.position = "relative";
 targetElement.style.zIndex = "1";

 // 画像を対象要素に追加（背後に表示）
 targetElement.appendChild(imgElement);

 // 対象要素内のすべてのテキストノードに白色の枠を適用
 const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT, null, false);
 const textNodes = [];
 let node;
 while (node = walker.nextNode()) {
  textNodes.push(node);
 }

 textNodes.forEach(textNode => {
  const span = document.createElement("span");
  span.textContent = textNode.textContent;
  span.style.cssText = `
   -webkit-text-stroke: 0.5px white; /* 白色の枠（Webkit系ブラウザ） */
   text-stroke: 0.5px white; /* 標準プロパティ */
   color: black; /* 文字色を黒に変更 */
   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* 文字に影を追加（任意） */
  `;
  textNode.parentNode.replaceChild(span, textNode);
 });


 console.log("Image added as background and text styled with white outline.");
} else {
 console.error("Target element not found. Please check the XPath.");
}



  
  // 壁紙の初期化
  const form1 = document.getElementById("form1");
  if (!form1) {
    console.log("#form1 is not found; aborting");
    return;
  }
  form1.style.backgroundImage = 'url(https://images.alphacoders.com/128/1287792.png)';
  form1.style.backgroundRepeat = 'no-repeat';
  form1.style.backgroundAttachment = 'fixed';
  form1.style.backgroundSize = 'cover';
}, 2000);

document.addEventListener('DOMContentLoaded', function() {
  const tableCells = document.querySelectorAll('#nan-contents table.nan-table-noborder td');
  tableCells.forEach(cell => {
    cell.addEventListener('mouseenter', function() {
      cell.style.backgroundColor = '#3498db';
      cell.style.color = '#ffffff';
    });
    cell.addEventListener('mouseleave', function() {
      cell.style.backgroundColor = '';
      cell.style.color = '#2c3e50';
    });
  });
});


const newTargetElementXPath = '/html/body/div/div[1]';
const newTargetElement = document.evaluate(newTargetElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


if (newTargetElement) {
  newTargetElement.style.display = 'none';
} else {
  console.log("指定された要素が見つかりませんでした。");
}



const imageUrl = "https://cdn.discordapp.com/attachments/1192002843662618624/1324667755148083261/12.png?ex=68075e7b&is=68060cfb&hm=5a1631d6ec0c3b689f785c030d46ca5351e9e733d6898c79752714d4e8844826&";

const targetElementXPath = '//*[@id="nan-contents"]/div[8]/div/div/div/div/div/table/tbody/tr/td[2]/img';
const targetElement = document.evaluate(targetElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


if (targetElement && targetElement.tagName === 'IMG') {
  targetElement.src = imageUrl;
} else {
  console.log("指定された要素が見つからないか、画像要素ではありません。");
}

setTimeout(() => {
  // ここに3秒待ってから実行したいコードを書く

  // 雑多なCSSを注入
  const styleElement = document.createElement('style');
  styleElement.textContent = `
  .tutorialDialog {
    display: none !important;
  }
  
  body {
    background-color: black !important;
  }
  
  div.navBody {
    background-color: black !important;
    border-color: black !important;
  }
  
  div.navHeaderGrid {
    background-color: black !important;
    border-color: black !important;
    color: white !important;
  }
  
  div.listViewCellInner {
    background-color: black !important;
    color: white !important;
  }
  
  div.listViewCell {
    background-color: black !important;
    border-color: #151515 !important;
  }
  div.listViewSection {
    background-color: black !important;
  }
  
  a.uiPopoverItem {
    background-color: black !important;
    border-color: black !important;
  }
  
  div.uiPopoverItem {
    background-color: black !important;
    backdrop-filter: blur(12px) !important;
    border-color: black !important;
  }
  
  div.navHeader {
    background-color: black !important;
    border-color: black !important;
  }
  
  select.uiLangSelector {
    background-color: #212121 !important;
    border-radius: 14px !important;
    color: white !important;
  }
  
  div.internalButton.desktopBackButton {
    background-color: black !important;
    border-top-left-radius: 8px !important;
    border-top-right-radius: 8px !important;
    margin-top: 10px !important;
    margin-left: 10px !important;
  }
  
  div.menu {
    background-color: black !important;
    border-bottom-left-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
    margin-left: 10px !important;
  }
  
  span.submissionBoardTitleInner {
    background-color: black !important;
    color: white !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
  
  div.submissionBoardTitle {
    background-color: black !important;
    border-top-right-radius: 10px !important;
    border-bottom-right-radius: 10px !important;
    padding: 10px !important;
  }
  
  div.timelineBalloonContent {
    background-color: black !important;
  }
  
  div.timelineBalloonArrow {
    display: none !important;
  }
  
  div.timelineEntryMessage {
    color: white !important;
  }
  
  img.timelineEntryDescIcon {
    display: none !important;
  }
  
  div.mstMenu {
    margin-left: 10px !important;
  }
  
  div.nav {
    background-color: black !important;
  }
  
  div.listViewRoundButtonInner {
    background-color: black !important;
    border-radius: 30px !important;
  }
  
  div.uiSortButtonPopoverAnchor {
    background-color: black !important;
    color: white !important;
  }
  
  div.uiSortButtonDropdownArrow {
    background-color: white !important;
  }
  
  div.uiPopoverItem.uiSortMenuItem {
    background-color: #151515 !important;
    border-radius: 20px !important;
  }
  
  div.uiPopoverTriInner {
    display: none !important;
  }
  
  div.uiSortMenuItemTitle {
    color: white !important;
  }
  
  div.submissionListMiddleHeader {
    background-color: black !important;
  }
  
  div.submissionListCell {
    border: black !important;
  }
  
  div.ellipsisText.submissionListCellUserName {
    color: white !important;
    border: black !important;
    height: 40 !important;
    background-color: #222222 !important;
  }
  
  div.editorTimestampAuthorNamePageNumber {
    background-color: black !important;
    color: white !important;
    border: 20px !important;
    padding: 10px !important;
  }
  
  div.submissionBoardTime {
    margin-top: px !important;
    border-color: black !important;
    border-top-left-radius: 10px !important;
    border-bottom-left-radius: 10px !important;
    height: 46px !important;
    text-align: center !important;
    background-color: black !important;
  }
  
  div.submissionBoard :nth-of-type(2) {
    width: 0px !important;
  }
  
  div.submissionHistoryDueItem {
    background-color: black !important;
    border-color: #212121 !important;
  }
  
  div.submissionHistoryPopoverSubmitDate {
    color: white !important;
    font-size: 14px !important;
    border-color: #212121 !important;
  }
  
  div.uiPopoverItem.submissionHistoryPopoverItem ::before {
    border-color: #212121 !important;
  }
  
  div.submissionHistoryPopover {
    background-color: black !important;
  }
  
  div.uiPopover {
    background-color: black !important;
  }
  
  .fullScreenPortal.drawerPortal.drawerPortal-enter-done {
      backdrop-filter: blur(10px) !important;
  }
  .fadeModal.centerModal.up.up-enter-done {
      backdrop-filter: blur(10px) !important;
  }
  .fadeModal.fade.fade-enter-done {
      backdrop-filter: blur(10px) !important;
  }
  
  div.name {
    display: none !important;
  }
  
  div.row {
    color: #9cffaf !important;
  }
  
  :root {
    --primaryBlue: #dd0000 !important;
    --primaryBlueTint: #0467de !important;
    --primaryBlueHighlight: #b2d8ff !important;
    --disabledColor: #b6b6b9 !important;
    --disabledBorderColor: #6d6d72 !important;
    --neutralColor: #aaaaaa !important;
    --whiteHilightColor: #ccc !important;
    --warnYellow: #ffe44d !important;
    --errorRed: #ff5e4d !important;
    --desktopBackColor: #333333 !important;
  }

  #nan-contents table.nan-table-noborder {
    font-size: 1em !important;
    border-collapse: separate !important;
    width: 100% !important;
    background-color: #ecf0f1 !important;
    border: none !important;
    border-radius: 15px !important;
    overflow: hidden !important;
    margin: 2em 0 !important;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
}

#nan-contents table.nan-table-noborder th,
#nan-contents table.nan-table-noborder td {
    padding: 1em 1.5em !important;
    text-align: left !important;
    border: none !important;
    word-break: keep-all !important;
    transition: background-color 0.3s ease, color 0.3s ease !important;
}

#nan-contents table.nan-table-noborder th {
    background-color: #2c3e50 !important;
    color: #ecf0f1 !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    font-size: 1.1em !important;
    letter-spacing: 0.05em !important;
}

#nan-contents table.nan-table-noborder td {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    position: relative !important;
    cursor: pointer !important;
}

#nan-contents table.nan-table-noborder tr:nth-child(even) td {
    background-color: #f9f9f9 !important;
}

#nan-contents table.nan-table-noborder tr:hover td {
    background-color: #bdc3c7 !important;
    color: #ffffff !important;
}

#nan-contents table.nan-table-noborder tr td:before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 4px !important;
    height: 100% !important;
    background-color: #2980b9 !important;
    transform: scaleY(0) !important;
    transition: transform 0.3s ease !important;
}

#nan-contents table.nan-table-noborder tr:hover td:before {
    transform: scaleY(1) !important;
}

#nan-contents table.nan-table-noborder caption {
    caption-side: bottom !important;
    font-size: 0.9em !important;
    color: #666 !important;
    padding: 0.5em !important;
    font-style: italic !important;
}
  `;
  document.head.appendChild(styleElement);
  
  // 壁紙の URL を配列で保持
  const wallpaper_array = [
    "https://t3.ftcdn.net/jpg/04/11/39/78/360_F_411397833_p9fFWIC8km1OYyAHj9O1pKyGqMpkP245.jpg",
    "https://w.forfun.com/fetch/e0/e0f517f1615f929996434bc9f3a737e4.jpeg?w=1000&r=0.5625",
    "https://upload-os-bbs.hoyolab.com/upload/2024/03/28/3ebf13798d3d402da99b0cd22dd5c275_349051803432104521.jpg?x-oss-process=image%2Fresize%2Cs_1000%2Fauto-orient%2C0%2Finterlace%2C1%2Fformat%2Cwebp%2Fquality%2Cq_80",
  ];
  
  // 現在の壁紙のインデックス
  let current_wallpaper_index = 0;
  
  // 壁紙を変更するボタンを追加
  const menu = document.getElementsByClassName("menu");
  if (menu.length === 0) {
    console.log(".menu is not found; aborting");
    return;
  }
  const change_wallpaper_button = document.createElement("div");
  change_wallpaper_button.className = "menuButton";
  menu[0].appendChild(change_wallpaper_button);
  
  // 壁紙変更ボタンにアイコンを追加
  const change_wallpaper_button_icon = document.createElement("img");
  change_wallpaper_button_icon.className = "menuButtonIcon";
  change_wallpaper_button_icon.src = "https://media.istockphoto.com/id/1201223949/ja/%E3%83%99%E3%82%AF%E3%82%BF%E3%83%BC/%E5%B7%A6%E3%81%A8%E5%8F%B3%E3%81%AE%E7%B7%9A%E3%81%AE%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AB%E7%9F%A2%E5%8D%B0%E7%99%BD%E3%81%84%E8%83%8C%E6%99%AF%E3%81%AB%E9%9A%94%E9%9B%A2%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB%E5%9B%B3.jpg?s=612x612&w=0&k=20&c=s3i3sLqQDe0aSZZ84EZuF8hMySK1q7Nwa5phZl4DPLI=";
  change_wallpaper_button_icon.setAttribute("alt", "壁紙を変更");
  change_wallpaper_button.appendChild(change_wallpaper_button_icon);
  
  // 壁紙変更ボタンにタイトルを追加
  const change_wallpaper_button_title = document.createElement("div");
  change_wallpaper_button_title.className = "menuTitle";
  change_wallpaper_button_title.innerText = `壁紙を変更(${current_wallpaper_index + 1}/${wallpaper_array.length})`;
  change_wallpaper_button.appendChild(change_wallpaper_button_title);
  
  // 壁紙の状態をロードする関数
  const wallpaper_load = () => {
    const main = document.getElementById("main");
    if (!main) {
      console.log("#main is not found; aborting");
      return;
    }
    change_wallpaper_button_title.innerText = `壁紙を変更(${current_wallpaper_index + 1}/${wallpaper_array.length})`;
    main.style.backgroundImage = `url(${wallpaper_array[current_wallpaper_index]})`;
  };
  
  // 壁紙の初期化
  wallpaper_load();
  
  // 壁紙変更ボタンをクリックしたときの処理
  change_wallpaper_button.onclick = () => {
    if (current_wallpaper_index < wallpaper_array.length - 1) {
      current_wallpaper_index += 1;
    } else {
      current_wallpaper_index = 0;
    }
    wallpaper_load();
  };
}, 1000);

function applyBoardStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    #nan-contents table.nan-bboard {
      margin: 1.5em 1em 0.5em 1em;
      border: 1px solid rgb(0, 80, 62);
      color: rgb(255, 255, 255);
      font-size: 0.8em; /* フォントサイズを小さくしました */
      border-collapse: collapse;
      word-break: keep-all;
      white-space: nowrap;
      vertical-align: middle;
    }
    #nan-contents table.nan-bboard th,
    #nan-contents table.nan-bboard td {
      padding: 0.4em 0.8em;
      border: 1px solid rgb(84, 138, 126);
      word-break: keep-all;
    }
    #nan-contents table.nan-bboard thead th,
    #nan-contents table.nan-bboard thead td {
      background-color: rgb(0, 80, 62);
      color: white;
    }
    #nan-contents table.nan-bboard thead td.light {
      background-color: rgb(115, 179, 92);
      color: rgb(0, 80, 62);
    }
    #nan-contents table.nan-bboard tbody tr {
      background-color: rgb(26, 98, 81);
    }
    #nan-contents table.nan-bboard tbody tr th,
    #nan-contents table.nan-bboard tbody tr:hover,
    #nan-contents table.nan-bboard tbody td {
      background-color: rgb(26, 98, 81);
      color: white;
    }
    #nan-contents table.nan-bboard tbody td.light {
      background-color: rgb(115, 179, 92);
      color: rgb(0, 80, 62);
    }
    #nan-contents table.nan-bboardbase {
      padding: 3em;
      word-break: keep-all;
      white-space: nowrap;
      float: left;
    }
    #nan-contents table.nan-bboardbase td {
      border: 0.5em solid rgb(130, 105, 67);
      background-color: rgb(26, 98, 81);
      word-break: keep-all;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(styleElement);
}

applyBoardStyles();
