let bets = {}
let jsonifyThis = []
let maxTableRows = 15  // Per Page
let currentPage = 1
let maxPages = 1
const testing = true

/*
Current Issues:
Table Display Limit (Random) ***FIXED***
Bettor Name resubmit will remove the last instance, could be fixed with, if this bettor already exists in that agent's db.
When adding another bet from the same agent, after a different agent it should be at the lowest, instead of being with the others

To add:
Edit (DONE) or Delete/Remove

Error Catching:
None so far
*/

class Bet {
    constructor(agent, bettor_name, combination, amount, bet_type, payment_mode, date) {
        this.agent = agent
        this.bettor_name = bettor_name
        this.combination = combination
        this.amount = amount
        this.bet_type = bet_type
        this.payment_mode = payment_mode
        this.date = date
    }
}

function submit() {
    const agentInput = document.getElementById('Agent')
    const textArea = document.getElementById('Bets')
    const combinationsText = textArea.value
    const Array = combinationsText.split(/\n/)
    const Agent = agentInput.value
    const specialChars = `/[!@#$%^&*()_+\\[\]{};':"\\|,.<>\/?]+/;`
    let mop
    let errorText = ""
    let currentName

    Agent = "a"
    

    if (document.getElementById('gcash').checked) mop = "GCASH"
    else if (document.getElementById('stc').checked) mop = "STC"

    if (!Agent || !textArea || !mop) {
        window.alert("You have a missing required information/s!")
        return
    }

    for (let line in Array) {
        let text = Array[line]
        if (text.startsWith('@')) {
            currentName = text.substring(1)
        } else if (text != "") {
            temp = text
            text = text.replace(/\s+/g, '')
            text = text.replaceAll("-", "")
            text = text.replaceAll("=", "")
            const isSpecialCharsPresent = specialChars.split('').some(char => 
                text.includes(char))
            if (isSpecialCharsPresent) {
                errorText += temp
                break
            }
            let type = (text.includes("S") || text.includes("s")) ? 'S' : 'R'
            let amount = text.substring(3, text.length - 1)
            let date = new Date()
            let newDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            bets[Object.keys(bets).length + 1] = new Bet(Agent, currentName, [text[0], text[1], text[2]], amount, type, mop, newDate)
            jsonifyThis.push({'Agent': Agent, 'Bettor': currentName, 'N1': text[0], 'N2': text[1], 'N3': text[2], 'Amount': amount, 'Type': type, 'Mode': mop, 'Combination': text, 'Date': newDate})
        }
    }
    if (errorText != "") {
        window.alert("The following lines are invalid!\n" + errorText)
        return
    }
    textArea.value = ""
    maxPages = Math.ceil(Object.keys(bets).length / maxTableRows)
    table()
}

function table() {
    let currentTableRow = 1;
    const table = document.getElementById('table')
    table.innerHTML = "<tr id='header'><tr id='header'><th style='width: 6%'>#</th><th style='width: 15%'>Agent</th><th>Bettor</th><th id='except'>N1</th><th id='except'>N2</th><th id='except'>N3</th><th id='except'>Amount</th><th>Type</th><th>Mode</th><th>Date</th><th>Action</th></tr>"
    for (currentBet in bets) {
        if (currentBet <= (currentPage - 1) * maxTableRows) continue
        const { agent, bettor_name, combination, amount, bet_type, payment_mode, date } = bets[currentBet]
        const rowData = [currentTableRow + (currentPage - 1) * maxTableRows, agent, bettor_name, combination[0], combination[1], combination[2], amount, bet_type, payment_mode, date]
        const row = document.createElement('tr')
        row.setAttribute('id', 'BetNumber'+currentTableRow)
        rowData.forEach(data => {
            const cell = document.createElement('td')
            const cellText = document.createTextNode(data)
            cell.appendChild(cellText)
            row.appendChild(cell)
        })
        const editCell = document.createElement('td')
        const editData = document.createElement('a')
        const deleteData = document.createElement('a')
        editData.innerText = "Edit"
        editData.setAttribute('onclick', 'editData('+currentBet+')')
        editData.setAttribute('class', 'EditData')
        deleteData.innerText = "X"
        deleteData.setAttribute('onclick', 'deleteData('+currentBet+')')
        deleteData.setAttribute('class', 'EditData')
        editCell.appendChild(editData)
        editCell.appendChild(deleteData)
        row.appendChild(editCell)
        table.appendChild(row)
        if (currentTableRow == maxTableRows) {
            break
        }
        currentTableRow++
    }
}

function nextPage() {
    if (currentPage >= maxPages) return;
    currentPage++
    const page = document.getElementById("PageNumber")
    page.innerHTML = currentPage
    table()
}

function previousPage() {
    if (currentPage == 1) return;
    currentPage--
    const page = document.getElementById("PageNumber")
    page.innerHTML = currentPage
    table()
}

function editData(betNumber) {
    const row = document.getElementById("BetNumber"+betNumber)
    const editButton = row.getElementsByClassName('EditData')
    if (row.className == "editing") {
        row.children[1].innerHTML = row.children[1].children[0].value
        row.children[2].innerHTML = row.children[2].children[0].value
        row.children[3].innerHTML = row.children[3].children[0].value
        row.children[4].innerHTML = row.children[4].children[0].value
        row.children[5].innerHTML = row.children[5].children[0].value
        row.children[6].innerHTML = row.children[6].children[0].value
        row.children[7].innerHTML = row.children[7].children[0].value
        return
    }
    const agent = row.children[1]
    const bettor = row.children[2]
    const combination = [row.children[3], row.children[4], row.children[5]]
    const amount = row.children[6]
    const MOP = row.children[7]
    row.children[1].innerHTML = `<input type="text" class="EditRowDatax" id="editAgent" value=${agent.textContent}>`
    row.children[2].innerHTML = `<input type="text" class="EditRowDatax" id="editBettor" value=${bettor.textContent}>`
    row.children[3].innerHTML = `<input type="text" class="EditRowData" id="editCombination1" value=${combination[0].textContent}>`
    row.children[4].innerHTML = `<input type="text" class="EditRowData" id="editCombination2" value=${combination[1].textContent}>`
    row.children[5].innerHTML = `<input type="text" class="EditRowData" id="editCombination3" value=${combination[2].textContent}>`
    row.children[6].innerHTML = `<input type="text" class="EditRowData" id="editAmount" value=${amount.textContent}>`
    row.children[7].innerHTML = `<input type="text" class="EditRowData" id="editMOP" value=${MOP.textContent}>`
    row.setAttribute('class', 'editing')
    editButton.innerText = "Save"
}

function deleteData(betNumber) {
    const table = document.getElementById("table")
    const row = document.getElementById("BetNumber"+betNumber)
    table.removeChild(row)
    delete bets[betNumber]
    console.log(bets)
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