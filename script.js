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
    const existingOverlay = document.getElementById(`white-grid-overlay-${index}`);
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // 画像の位置とサイズを取得
    const rect = img.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // 白い四角形のオーバーレイ要素を作成
    const overlay = document.createElement('div');
    overlay.id = `white-grid-overlay-${index}`;
    overlay.className = 'white-grid-overlay';

    // スタイルを設定
    overlay.style.position = 'absolute';
    overlay.style.left = (rect.left + scrollX) + 'px';
    overlay.style.top = (rect.top + scrollY) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.backgroundColor = 'white';
    overlay.style.pointerEvents = 'none'; // クリックイベントを無効化
    overlay.style.zIndex = '10';
    overlay.style.borderRadius = getComputedStyle(img).borderRadius;
    overlay.style.opacity = '1';
    overlay.style.transition = 'opacity 0.75s ease-out';

    // bodyに追加
    document.body.appendChild(overlay);

    // 0.5秒後にフェードアウト開始
    setTimeout(() => {
        overlay.style.opacity = '0';
    }, 200);
}

// ウィンドウリサイズ時にオーバーレイを再配置
function handleResize() {
    const overlays = document.querySelectorAll('.white-grid-overlay');
    overlays.forEach(overlay => {
        const index = overlay.id.split('-').pop();
        const img = document.querySelector(`img.white-grid:nth-of-type(${parseInt(index) + 1})`);
        if (img) {
            createOverlay(img, index);
        }
    });
}

// スクロール時にオーバーレイを再配置
function handleScroll() {
    const overlays = document.querySelectorAll('.white-grid-overlay');
    overlays.forEach(overlay => {
        const index = overlay.id.split('-').pop();
        const img = document.querySelector(`img.white-grid:nth-of-type(${parseInt(index) + 1})`);
        if (img) {
            const rect = img.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;

            overlay.style.left = (rect.left + scrollX) + 'px';
            overlay.style.top = (rect.top + scrollY) + 'px';
        }
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
