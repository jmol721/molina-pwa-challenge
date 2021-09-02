let db;
const request = indexedDB.open('budget_info', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget_info', { autoIncrement: true });
};

request.onsuccess = function(event) {

    db = event.target.result;

    if (navigator.onLine) {
        uploadBudgetInfo();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_budget_info'], 'readwrite');

    const budgetInfoObjectStore = transaction.objectStore('new_budget_info');

    budgetInfoObjectStore.add(record);
}

function uploadBudgetInfo() {
    const transaction = db.transaction(['new_budget_info'], 'readwrite');

    const budgetInfoObjectStore = transaction.objectStore('new_budget_info');

    const getAll = budgetInfoObjectStore.getAll();

    getAll.onsuccess = function() {
        
        if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                
                const transaction = db.transaction(['new_budget_info'], 'readwrite');
                
                const budgetInfoObjectStore = transaction.objectStore('new_budget_info');
                
                budgetInfoObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

window.addEventListener('online', uploadBudgetInfo);