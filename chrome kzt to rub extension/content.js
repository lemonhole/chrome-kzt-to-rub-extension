// Задайте актуальный курс обмена (например, 1 тенге = 0.18 рублей)
const KZT_TO_RUB_RATE = 0.18;

// Функция для поиска и конвертации текста
function convertKztToRub(node) {
    // Регулярное выражение ищет числа, за которыми следует ₸, тг, тг. или KZT
    const regex = /(\d[\d\s.,]*)\s*(₸|тг\.?|KZT)/gi;

    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        if (regex.test(text)) {
            // Сбрасываем индекс регулярного выражения после теста
            regex.lastIndex = 0; 
            
            node.nodeValue = text.replace(regex, (match, priceStr) => {
                // Очищаем строку с ценой от пробелов и приводим к стандартному float-формату
                let cleanPrice = priceStr.replace(/\s/g, '').replace(',', '.');
                let parsedPrice = parseFloat(cleanPrice);

                if (!isNaN(parsedPrice)) {
                    let rubPrice = (parsedPrice * KZT_TO_RUB_RATE).toFixed(2);
                    // Красиво форматируем получившиеся рубли (разделяем тысячи пробелами)
                    let formattedRub = parseFloat(rubPrice).toLocaleString('ru-RU');
                    return `${formattedRub} ₽ (${match})`; // Покажет цену в ₽, а в скобках оставит оригинал
                }
                return match;
            });
        }
    } else {
        // Рекурсивно обходим все дочерние элементы страницы, кроме скриптов и стилей
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'TEXTAREA') {
            for (let child of node.childNodes) {
                convertKztToRub(child);
            }
        }
    }
}

// Запуск первичной конвертации при загрузке страницы
convertKztToRub(document.body);

// Отслеживание динамического изменения контента (например, при ленивой загрузке или AJAX)
const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        for (let addedNode of mutation.addedNodes) {
            convertKztToRub(addedNode);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
