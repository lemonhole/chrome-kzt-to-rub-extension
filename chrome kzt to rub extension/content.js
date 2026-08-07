const DEFAULT_RATE = 0.18;

// Читаем курс и настройку отображения из памяти
chrome.storage.local.get(['kzt_rate', 'show_kzt'], (result) => {
    const currentRate = result.kzt_rate || DEFAULT_RATE;
    // По умолчанию теперь false (показывать только рубли)
    const showKzt = result.show_kzt === true; 
    
    // Передаем параметры в функцию парсинга страницы
    convertKztToRub(document.body, currentRate, showKzt);

    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                convertKztToRub(addedNode, currentRate, showKzt);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function convertKztToRub(node, rate, showKzt) {
    const regex = /(\d[\d\s.,]*)\s*(₸|тг\.?|KZT)/gi;

    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        if (regex.test(text)) {
            regex.lastIndex = 0; 
            
            node.nodeValue = text.replace(regex, (match, priceStr) => {
                let cleanPrice = priceStr.replace(/\s/g, '').replace(',', '.');
                let parsedPrice = parseFloat(cleanPrice);

                if (!isNaN(parsedPrice)) {
                    let rubPrice = (parsedPrice * rate).toFixed(2);
                    let formattedRub = parseFloat(rubPrice).toLocaleString('ru-RU');
                    
                    // Если true — выводим обе цены, если false — только рубли
                    return showKzt ? `${formattedRub} ₽ (${match})` : `${formattedRub} ₽`;
                }
                return match;
            });
        }
    } else {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'TEXTAREA') {
            for (let child of node.childNodes) {
                convertKztToRub(child, rate, showKzt);
            }
        }
    }
}
