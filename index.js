let numberOfBets;
let dictionary = {};
let currentName;
let currentBetNumber = 1;
let agentBettors = {};
let jsonifyThis = [];

/*
- Change MOP (Dropdown) to Select Option
*/

function submit() {
    const agentInput = document.getElementById('Agent');
    const textArea = document.getElementById('Bets');
    const combinationsText = textArea.value;
    const Array = combinationsText.split(/\n/);
    const Agent = agentInput.value;
    let mop;

    if (document.getElementById('gcash').checked) mop = "GCASH";
    else if (document.getElementById('stc').checked) mop = "STC";

    if (!Agent || !textArea || !mop) {
        window.alert("You have a missing required information/s!");
        return;
    }

    dictionary[Agent] = {};
    
    for (let line in Array) {
        let text = Array[line];
        if (text.startsWith('@')) {
            currentName = text.substring(1);
            dictionary[Agent][currentName] = [];
        } else if (text.includes("=")) {
            let combination = text.substring(0, text.indexOf("="));
            combination = combinationValidation(combination);
            let type = (text.includes("S") || text.includes("s")) ? 'Straight' : 'Ramble';
            let amount = text.substring(text.indexOf("=") + 1, text.length - 1);
            let date = new Date();
            let newDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            dictionary[Agent][currentName].push({'Combination': `${combination[0]}-${combination[1]}-${combination[2]}` ,'Type': type, 'Amount': amount, 'Date': newDate, 'Mode': mop});
            jsonifyThis.push({'Agent': Agent, 'Bettor': currentName, 'N1': combination[0], 'N2': combination[1], 'N3': combination[2], 'Amount': amount, 'Type': type, 'Mode': mop, 'Combination': combination, 'Date': newDate});
            numberOfBets++;
        }
    }
    table();
}

function table() {
    const table = document.getElementById('table');
    for (agent in dictionary) {
        for (bettor in dictionary[agent]) {
            for (bet in dictionary[agent][bettor]) {
                const { Combination, Type, Amount, Date, Mode } = dictionary[agent][bettor][bet];
                const rowData = [currentBetNumber, agent, bettor, Combination[0], Combination[2], Combination[4], Amount, Type, Mode, Date];
                const row = document.createElement('tr');
                rowData.forEach(data => {
                    const cell = document.createElement('td');
                    const cellText = document.createTextNode(data);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                });
                table.appendChild(row);
                currentBetNumber++;
            }
        }
    }
}

/*
@Auchi B. A
0-0-1=30S
0-1-5=50R
*/

function csvConvert(el) {
    let csvRows = [];
    const headers = ["Agent", "Bettor", "N1", "N2", "N3", "Amount", "Type", "Mode", "Combination", "Date"];
    csvRows.push(headers.join(','));  
    for (let bet in jsonifyThis) {
        const values = Object.values(jsonifyThis[bet]).join(','); 
        csvRows.push(values);
    }

    let csvContent = '';
    csvRows.forEach(row => {
        csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' }); 
    const url = window.URL.createObjectURL(blob) 
    el.setAttribute("href", url);
    el.setAttribute("download", "data.csv");
}

function combinationValidation(combination) {
    let combinations = "";
    for (let x in combination) {
        if (parseInt(combination[x]) || parseInt(combination[x]) === 0) { combinations += combination[x]; }
    }
    return combinations;
}

/*
@Auchi B. A
0-0-1=30S
0-1-5=50R
*/

function csvConvert(el) {
    let csvRows = [];
    const headers = ["Agent", "Bettor", "N1", "N2", "N3", "Amount", "Type", "Mode", "Combination", "Date"];
    csvRows.push(headers.join(','));  
    for (let bet in jsonifyThis) {
        const values = Object.values(jsonifyThis[bet]).join(','); 
        csvRows.push(values);
    }

    let csvContent = '';
    csvRows.forEach(row => {
        csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' }); 
    const url = window.URL.createObjectURL(blob) 
    el.setAttribute("href", url);
    el.setAttribute("download", "data.csv");
}

function combinationValidation(combination) {
    let combinations = "";
    for (let x in combination) {
        if (parseInt(combination[x]) || parseInt(combination[x]) === 0) { combinations += combination[x]; }
    }
    return combinations;
}

/*
@Auchi B. A
0-0-1=30S
0-1-5=50R
*/