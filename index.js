let dictionary = {}
let currentName
let agentBettors = {}
let jsonifyThis = []
let tabled_rows = []

function submit() {
    const agentInput = document.getElementById('Agent')
    const textArea = document.getElementById('Bets')
    const combinationsText = textArea.value
    const Array = combinationsText.split(/\n/)
    const Agent = agentInput.value
    const specialChars = `/[!@#$%^&*()_+\\[\]{};':"\\|,.<>\/?]+/;`
    let mop
    let errorText = ""

    if (document.getElementById('gcash').checked) mop = "GCASH"
    else if (document.getElementById('stc').checked) mop = "STC"

    if (!Agent || !textArea || !mop) {
        window.alert("You have a missing required information/s!")
        return
    }

    if (Object.keys(dictionary).length == 0) dictionary[Agent] = {}
    else if (!Object.keys(dictionary).includes(Agent)) dictionary[Agent] = {}
    
    for (let line in Array) {
        let text = Array[line]
        if (text.startsWith('@')) {
            currentName = text.substring(1)
            dictionary[Agent][currentName] = []
        } else if (text != "") {
            temp = text
            text = text.replace(/\s+/g, '');
            text = text.replaceAll("-", "");
            text = text.replaceAll("=", "");
            const isSpecialCharsPresent = specialChars.split('').some(char => 
                text.includes(char))
            if (isSpecialCharsPresent) {
                errorText += temp
                break
            }
            let type = (text.includes("S") || text.includes("s")) ? 'S' : 'R'
            let amount = text.substring(3, text.length - 1)
            let date = new Date()
            let newDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            dictionary[Agent][currentName].push({'Combination': `${text[0]}-${text[1]}-${text[2]}` ,'Type': type, 'Amount': amount, 'Date': newDate, 'Mode': mop})
            jsonifyThis.push({'Agent': Agent, 'Bettor': currentName, 'N1': text[0], 'N2': text[1], 'N3': text[2], 'Amount': amount, 'Type': type, 'Mode': mop, 'Combination': text, 'Date': newDate})
        }
    }
    if (errorText != "") {
        window.alert("The following lines are invalid!\n" + errorText)
        return
    }
    textArea.value = ""
    table()
}

function combinationValidation(combination) {
    let combinations = ""
    for (let x in combination) {
        if (parseInt(combination[x]) || parseInt(combination[x]) === 0) { combinations += combination[x] }
    }
    return combinations
}

function table() {
    let currentBetNumber = 1
    const table = document.getElementById('table')
    table.innerHTML = "<tr id='header'><tr id='header'><th style='width: 6%'>#</th><th style='width: 15%'>Agent</th><th>Bettor</th><th id='except'>N1</th><th id='except'>N2</th><th id='except'>N3</th><th id='except'>Amount</th><th>Type</th><th>Mode</th><th>Date</th></tr>"
    console.log(dictionary)
    for (agent in dictionary) {
        for (bettor in dictionary[agent]) {
            for (bet in dictionary[agent][bettor]) {
                const { Combination, Type, Amount, Date, Mode } = dictionary[agent][bettor][bet]
                const rowData = [currentBetNumber, agent, bettor, Combination[0], Combination[2], Combination[4], Amount, Type, Mode, Date]
                const row = document.createElement('tr')
                rowData.forEach(data => {
                    const cell = document.createElement('td')
                    const cellText = document.createTextNode(data)
                    cell.appendChild(cellText)
                    row.appendChild(cell)
                });
                table.appendChild(row)
                currentBetNumber++
            }
        }
    }
}

/*
@Lina Guevara 
9 1 3 2r
9 1 0 1r

@Alina J Alexander 
0 2 9 2s
0 2 9 1r

@Rosevielyn Ferrer Bernardino 
5 3 1 2r                 
3 2 4 2r

@Muhannad Sidik Upam Nanding 
5 0 8 3s
5 0 8 2r
7 0 2 3s
7 0 2 2r

@Lyn Cataina Yape 
9 1 2=1s
7 5 1=1s
9 1 5=1s
9 1 2=1r
7 5 1=1r
9 1 5=1r
*/

function csvConvert(el) {
    let csvRows = []
    const headers = ["Agent", "Bettor", "N1", "N2", "N3", "Amount", "Type", "Mode", "Combination", "Date"]
    csvRows.push(headers.join(',')); 
    for (let bet in jsonifyThis) {
        const values = Object.values(jsonifyThis[bet]).join(',');
        csvRows.push(values)
    }

    let csvContent = ''
    csvRows.forEach(row => {
        csvContent += row + '\n'
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob) 
    el.setAttribute("href", url)
    el.setAttribute("download", "data.csv")
}