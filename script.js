// white-gridクラスが付与された画像に白い四角形を覆い被さるように配置する関数
function createWhiteGridOverlay() {
    // white-gridクラスが付与された画像を全て取得
    const images = document.querySelectorAll('img.white-grid');

    images.forEach((img, index) => {
        // 画像が読み込まれるまで待機
        if (img.complete) {
            createOverlay(img, index);
        } else {
            img.addEventListener('load', () => createOverlay(img, index));
        }
    });
}

// 個別の画像に対してオーバーレイを作成する関数
function createOverlay(img, index) {
    // 既にオーバーレイが存在する場合は削除
    const existingOverlays = document.querySelectorAll(`[id^="white-grid-overlay-${index}-"]`);
    existingOverlays.forEach(overlay => overlay.remove());

    // 画像の位置とサイズを取得
    const rect = img.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // 8×6のグリッドを作成（48個のグリッド）
    const gridPositions = [];
    const cols = 8;
    const rows = 6;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            gridPositions.push({
                x: col / cols,
                y: row / rows,
                name: `grid-${row}-${col}`,
                row: row,
                col: col
            });
        }
    }

    const gridElements = [];

    gridPositions.forEach((pos, gridIndex) => {
        // 各グリッドのオーバーレイ要素を作成
        const overlay = document.createElement('div');
        overlay.id = `white-grid-overlay-${index}-${pos.name}`;
        overlay.className = 'white-grid-overlay';

        // スタイルを設定
        overlay.style.position = 'absolute';
        overlay.style.left = (rect.left + scrollX + rect.width * pos.x) + 'px';
        overlay.style.top = (rect.top + scrollY + rect.height * pos.y) + 'px';
        overlay.style.width = (rect.width / cols) + 'px';
        overlay.style.height = (rect.height / rows) + 'px';
        overlay.style.backgroundColor = '#f5f5f5';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10';
        overlay.style.opacity = '1';
        overlay.style.transition = 'opacity 0.75s ease-out';

        // 角丸の設定（各グリッドの位置に応じて）
        const borderRadius = getComputedStyle(img).borderRadius;
        const isTopRow = pos.row === 0;
        const isBottomRow = pos.row === rows - 1;
        const isLeftCol = pos.col === 0;
        const isRightCol = pos.col === cols - 1;

        if (isTopRow && isLeftCol) {
            // 左上角
            overlay.style.borderTopLeftRadius = borderRadius;
        } else if (isTopRow && isRightCol) {
            // 右上角
            overlay.style.borderTopRightRadius = borderRadius;
        } else if (isBottomRow && isLeftCol) {
            // 左下角
            overlay.style.borderBottomLeftRadius = borderRadius;
        } else if (isBottomRow && isRightCol) {
            // 右下角
            overlay.style.borderBottomRightRadius = borderRadius;
        }

        // bodyに追加
        document.body.appendChild(overlay);
        gridElements.push(overlay);
    });

    // Zの字順と逆Nの字順で同時にフェードアウト
    const fadeDelay = 20; // 各グリッド間の遅延時間（ミリ秒）
    
    gridPositions.forEach((pos, gridIndex) => {
        // Zの字順（左上から右下へ）
        const zOrderIndex = pos.row * cols + pos.col;
        
        // 逆Nの字順（左上から右下へ、列ごとに交互）
        const reverseNOrderIndex = pos.col * rows + (pos.row % 2 === 0 ? pos.row : rows - 1 - pos.row);
        
        // より早い方のタイミングで消える
        const orderIndex = Math.min(zOrderIndex, reverseNOrderIndex);
        
        setTimeout(() => {
            if (gridElements[gridIndex]) {
                gridElements[gridIndex].style.opacity = '0';
            }
        }, 200 + (orderIndex * fadeDelay));
    });
}

// ウィンドウリサイズ時にオーバーレイを再配置
function handleResize() {
    const images = document.querySelectorAll('img.white-grid');
    images.forEach((img, index) => {
        createOverlay(img, index);
    });
}

// スクロール時にオーバーレイを再配置
function handleScroll() {
    const images = document.querySelectorAll('img.white-grid');
    images.forEach((img, imgIndex) => {
        const rect = img.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // 各グリッドの位置を更新
        const cols = 8;
        const rows = 6;
        const gridPositions = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                gridPositions.push({
                    x: col / cols,
                    y: row / rows,
                    name: `grid-${row}-${col}`,
                    row: row,
                    col: col
                });
            }
        }

        gridPositions.forEach((pos, gridIndex) => {
            const overlay = document.getElementById(`white-grid-overlay-${imgIndex}-${pos.name}`);
            if (overlay) {
                overlay.style.left = (rect.left + scrollX + rect.width * pos.x) + 'px';
                overlay.style.top = (rect.top + scrollY + rect.height * pos.y) + 'px';
            }
        });
    });
}

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', createWhiteGridOverlay);

// ウィンドウリサイズとスクロールのイベントリスナーを追加
window.addEventListener('resize', handleResize);
window.addEventListener('scroll', handleScroll);

// 画像の読み込み完了後にオーバーレイを作成するためのMutationObserver
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'IMG' && node.classList.contains('white-grid')) {
                        const index = Array.from(document.querySelectorAll('img.white-grid')).indexOf(node);
                        if (node.complete) {
                            createOverlay(node, index);
                        } else {
                            node.addEventListener('load', () => createOverlay(node, index));
                        }
                    }
                }
            });
        }
    });
});

// bodyを監視開始
observer.observe(document.body, { childList: true, subtree: true });
