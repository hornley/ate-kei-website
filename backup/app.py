import csv
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request
import re
from io import StringIO
from typing import List

app = FastAPI()

"""
Issues:
1. bettor's names can be not starting with an '@' which detects these names as an agent and so on.
- Solution: If the 'name' is followed by a bet, make that name be a bettor else agent
"""

# Template setup
templates = Jinja2Templates(directory="templates")

class Bet:
    def __init__(self, agent_name: str, bettor_name: str, bets: List[str], bet_amount: str, bet_type: str):
        self.agent_name = agent_name
        self.bettor_name = bettor_name
        self.bets = bets
        self.bet_amount = bet_amount
        self.bet_type = bet_type

    def __repr__(self):
        return f"Bet({self.agent_name},{self.bettor_name},{self.bets},{self.bet_amount},{self.bet_type})"


# In-memory list to store encoded bets (will reset when app restarts)
stored_bets: List[Bet] = []

# Default agent list (edit as needed)
AGENTS = ["Agent A", "Agent B", "Agent C"]


# Function to encode betting data
def parse_bets(agent_name: str, data: str) -> List[Bet]:
    """Parse the pasted bet data and return a list of Bet objects.

    Rules:
    - Agent name is provided by the dropdown; ignore any agent-like lines in the pasted data.
    - Bettor names: lines starting with '@' will set the current bettor. Lines that contain letters
      (and no bet pattern) will also be treated as bettor names.
    - Bet lines: flexible regex that accepts optional '=' and upper/lowercase s/r.
    """
    bets_out: List[Bet] = []
    if not data:
        return bets_out

    # normalize and split
    lines = [l.strip() for l in data.splitlines()]

    current_bettor = ""

    # pattern: three numbers, optional spaces, optional '=', amount, and S/R (case-insensitive)
    bet_pattern = re.compile(r"^\s*(\d+)\s+(\d+)\s+(\d+)\s*=?\s*(\d+)\s*([sSrR])\s*$")

    for line in lines:
        if not line:
            continue

        # normalize separators (commas, dashes -> spaces) and strip surrounding whitespace
        norm_line = line.replace(',', ' ').strip()
        norm_line = re.sub(r"[\-–—]", " ", norm_line)
        norm_line = re.sub(r"\s+", " ", norm_line)

        # bettor line starting with @
        if norm_line.startswith("@"):
            # strip @ and trailing punctuation (like a dot)
            current_bettor = norm_line.lstrip("@").strip().rstrip(".").strip()
            continue

        # if line contains alphabetic chars and does not match bet pattern, treat as bettor name
        if any(c.isalpha() for c in norm_line) and not bet_pattern.match(norm_line):
            current_bettor = norm_line.rstrip(".").strip()
            continue

        # try match bet line
        m = bet_pattern.match(norm_line)
        if m:
            num1, num2, num3, amount, btype = m.groups()
            btype = btype.upper()
            bet = Bet(agent_name, current_bettor, [num1, num2, num3], amount, btype)
            bets_out.append(bet)

    return bets_out


def get_alpha_count(str: str) -> int:
    count = 0
    for s in str:
        if s.isalpha():
            count += 1
    
    return count


def encode_betting_data(agent_name: str, data: str) -> List[Bet]:
    """Wrapper to parse bets and return Bet objects (keeps naming consistent with prior API)."""
    return parse_bets(agent_name, data)


# Route to display the form
@app.get("/", response_class=HTMLResponse)
async def read_form(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "agents": AGENTS})

# Route to handle the bet data and show formatted results
@app.post("/encode_betting_data", response_class=HTMLResponse)
async def encode_betting_data_endpoint(request: Request, agent_name: str = Form(...), bet_data: str = Form(...)):
    # Process the bet data and get the formatted results
    formatted_bets = encode_betting_data(agent_name, bet_data)

    # store into in-memory storage
    stored_bets.extend(formatted_bets)

    # Return the HTML response with the encoded betting data in list format
    return templates.TemplateResponse("results.html", {"request": request, "formatted_bets": formatted_bets, "bet_data": bet_data, "agent_name": agent_name})


@app.post("/check_bets", response_class=HTMLResponse)
async def check_bets_endpoint(request: Request, agent_name: str = Form(...), bet_data: str = Form(...)):
    # Parse and show results without storing
    formatted_bets = encode_betting_data(agent_name, bet_data)
    return templates.TemplateResponse("results.html", {"request": request, "formatted_bets": formatted_bets, "bet_data": bet_data, "agent_name": agent_name})

# Route to export betting data as CSV
@app.post("/export_csv")
async def export_csv(request: Request, agent_name: str = Form(...), bet_data: str = Form(...)):
    formatted_bets = encode_betting_data(agent_name, bet_data)

    # Create CSV in memory
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["agent_name", "bettor_name", "num1", "num2", "num3", "bet_amount", "bet_type"])
    for b in formatted_bets:
        writer.writerow([b.agent_name, b.bettor_name, b.bets[0], b.bets[1], b.bets[2], b.bet_amount, b.bet_type])

    output.seek(0)
    csv_bytes = output.getvalue().encode("utf-8")

    return StreamingResponse(iter([csv_bytes]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=betting_data.csv"})
