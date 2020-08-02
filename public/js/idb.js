// create variable to hold db connection
let db;
// establish connection to IndexedDB DB called budget and set it to version 1
const request = indexedDB.open('budget, 1');

request.onupgradeneeded = function(event) {
    //save reference to DB
    const db = event.target.result;
    //create a table called 'new budget', set it to have an auto incrementing primary key
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
    //when db is successfully created with table, save reference to db in global scope
    db = event.target.result;

    //check if app is online, if yes, run uploadBudget() to send all local db data to api
    if (navigator.online) {
        //uploadBudget
    }

};

request.onerror = function(event) {
    //error is logged in console here
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    //open new transaction with DB with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access table for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');

    //add record to your table with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    //open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access the table
    const budgetObjectStore = transaction.objectStore('new_budget');

    //get all records from table and set to a constant
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function()  {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
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
                    throw new Error (serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');
                //access the table
                const budgetObjectStore = transaction.objectStore('new_budget');
                //clear items in table
                budgetObjectStore.clear();

                alert('Your budget has been submitted.');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

//event listener for network connectivity
window.addEventListener('online', uploadBudget);