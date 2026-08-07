const DEFAULT_RATE = 0.18;
const rateInput = document.getElementById('rateInput');
const showKztCheck = document.getElementById('showKztCheck');
const saveBtn = document.getElementById('saveBtn');
const statusMsg = document.getElementById('statusMsg');

// При открытии окна подгружаем сохраненный курс и состояние чекбокса
chrome.storage.local.get(['kzt_rate', 'show_kzt'], (result) => {
    rateInput.value = result.kzt_rate || DEFAULT_RATE;
    showKztCheck.checked = result.show_kzt === true; 
});

saveBtn.addEventListener('click', () => {
    let newRate = parseFloat(rateInput.value);
    let isShowKzt = showKztCheck.checked;
    
    if (!isNaN(newRate) && newRate > 0) {
        // Сохраняем параметры в хранилище браузера
        chrome.storage.local.set({ 'kzt_rate': newRate, 'show_kzt': isShowKzt }, () => {
            statusMsg.textContent = 'Применено!';
            
            // Запрашиваем активную вкладку и принудительно перезагружаем её
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    const activeTab = tabs[0];
                    // Игнорируем внутренние страницы самого Chrome (chrome://)
                    if (activeTab.url && !activeTab.url.startsWith('chrome://')) {
                        chrome.tabs.reload(activeTab.id);
                    }
                }
            });

            setTimeout(() => { statusMsg.textContent = ''; }, 1500);
        });
    } else {
        alert('Пожалуйста, введите корректное число больше 0');
    }
});
