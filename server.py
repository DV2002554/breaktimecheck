# server.py
# Save and run as described in previous messages.
# Added pytz for timezone handling (GMT+7, Asia/Bangkok).
# Added checks for check_in (only if not already checked in without check out) and start_break (only if not already on break).
# Added new actions: upl, sl, al (marks the day as leave type).
# Added break_history column to store JSON list of breaks [{'start': time, 'end': time}].
# Updated action logic to append to break_history.
# Updated staff_history to include break_history details.

from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import pytz  # For GMT+7 timezone
import json

app = Flask(__name__)

# List of staff names (sorted alphabetically, duplicates kept as in original)
STAFF_NAMES = sorted([
    "MAO SIENGMENG", "JANEL", "SO VINAI", "TUONG PHENG AN", "ROBERT IBANEZ",
    "CHHET DEVITH", "LY CHHIN THEAN", "DOUNG CHANN", "NUOM POV PICH", "SIEM SAM NOEUN",
    "SOKA MANETH", "RIEM LINA", "SOR SIEVLY", "YOEURN NITA", "Seang Eang",
    "Roeurn Mab", "Khemara Davit", "KONG SREYPICH", "HUN RAVIN", "Suon Bunna",
    "Cheen Dara", "Mary Joy M. Ochinang", "Ericka Bheth B Cabral", "Allan S.Esteves",
    "Emil Esteves", "JESSA MEI PAGALA", "Karen Patricia M.Godin", "Phoebe J.Tamot",
    "Raymond  Ochinang", "Nan Sean Err", "LIV PHEAKDEY", "ART NEARDEY", "SENG CHHAYFOU",
    "YAN PHEA ROT", "MORNH SYPHAI", "KY EM CHENDA", "CHEA SOCHEAT", "LEY LIMENG",
    "LY TENGKIT", "Prek Tararoth", "Van Ravuth", "IENG YAT", "Heng Lun",
    "Leakhena", "Ly Khy", "Tann herseang", "Keo Pich Piden", "VANN SOMONEA",
    "Chea Dana", "Un Nima", "HONG KUNTHEA", "KEO SOTHEA", "KIM VANDETH",
    "PHAY SOPHORS", "SOEUR KEOPISEY", "KEV CHHENGLEANG", "MEAS MOLIKA", "TOEUNG NICH",
    "KHOM LICHA", "CHEM TYTY", "MOEUN SEYHA", "NOUM PAOPUTHIDARA", "PHY SOKVANNARY",
    "LACH PHOUMARITH", "CHHEN VANYUTH", "PHATT CHHEALIN", "CHAN SREYTOCH", "KUN SREYNA",
    "RAMESH", "Doung Vicheth", "Bav Oeurn", "Ngin Bora", "KHEAN VATHANAVITOU",
    "VANNA HORS", "Sopha Rathana", "SOVAN TYTY", "LOEM SIEU", "HOEUNG SONHENG",
    "SOK SOKUNTHEARO", "LIV KOSOL", "NUON NGUNHONG", "KEOUN THEARA", "KORN MUNINT",
    "SOEM SARIFAH", "OEUY CHHUNEII", "JEVIN LAURON", "KHAN CHANSOVANN NARITH",
    "ELSIE M. PRADO", "DK TEST", "DV TEST", "PHAT SREYENG", "HANG KIMHAK",
    "LORN SOKLY", "LORN SOKLY", "THIM CHHAN CHHAIN", "CHHORM VANTOEURN", "ROEUN SREYREP",
    "DK", "PATRECIAMAY GERBON", "JENELYN GELVEZON", "SEANG BONA", "HANG CHANRA",
    "POV PENGLONG", "TESTING", "POV PONNA", "SIN SREYMOM", "GERSON STA ANA",
    "KHOEURN RATANAK", "LIEM MARA", "SIN KAKADA", "PHON SAVY", "AIEN PUTHY",
    "YOU VEASNA", "Roeurn sokkheang", "JB Bernabe", "SORN SREYSAM", "VANN TINA",
    "CHREN SOVANRACHANA", "THONG KUNTHY", "SOT THARY", "REACH SREYMEY", "YANG KAKADA",
    "DORN DONG", "SOT THARY", "CHANN PISEY", "CHHUN PANHA", "LAY SENGDANA",
    "ROEURN CHHORK", "YEANG TEY"
])

# Timezone for GMT+7 (Asia/Bangkok)
TZ = pytz.timezone('Asia/Bangkok')

# Initialize database (added break_history TEXT column for JSON, leave_type TEXT)
def init_db():
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    # Create table if not exists
    c.execute('''CREATE TABLE IF NOT EXISTS attendance
                 (name TEXT, date TEXT, check_in TEXT, check_out TEXT,
                  break_count INTEGER DEFAULT 0, total_break REAL DEFAULT 0,
                  current_break_start TEXT, PRIMARY KEY (name, date))''')
    # Add break_history if not exists
    try:
        c.execute("ALTER TABLE attendance ADD COLUMN break_history TEXT DEFAULT '[]'")
    except sqlite3.OperationalError:
        pass  # Column already exists
    # Add leave_type if not exists
    try:
        c.execute("ALTER TABLE attendance ADD COLUMN leave_type TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    conn.commit()
    conn.close()

init_db()

# Function to get or create row for name and date
def get_or_create_row(name, date):
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT * FROM attendance WHERE name = ? AND date = ?", (name, date))
    row = c.fetchone()
    if not row:
        c.execute("INSERT INTO attendance (name, date) VALUES (?, ?)", (name, date))
        conn.commit()
    conn.close()

@app.route('/')
def index():
    today = datetime.now(TZ).date().isoformat()
    for name in STAFF_NAMES:
        get_or_create_row(name, today)
    return render_template('index.html', staff_names=STAFF_NAMES, today=today)

@app.route('/action', methods=['POST'])
def action():
    data = request.json
    name = data['name']
    if name not in STAFF_NAMES:
        return jsonify(success=False, message="Invalid staff name")
    act = data['action']
    now = datetime.now(TZ).isoformat()
    today = datetime.now(TZ).date().isoformat()

    get_or_create_row(name, today)  # Ensure row exists for today

    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()

    # Check current status
    c.execute("SELECT check_in, check_out, current_break_start, break_history FROM attendance WHERE name = ? AND date = ?", (name, today))
    row = c.fetchone()
    check_in = row[0]
    check_out = row[1]
    current_break_start = row[2]
    break_history = json.loads(row[3]) if row[3] else []

    if act == 'check_in':
        if check_in and not check_out:
            conn.close()
            return jsonify(success=False, message="Already checked in. Check out first.")
        c.execute("UPDATE attendance SET check_in = ? WHERE name = ? AND date = ?", (now, name, today))
    elif act == 'check_out':
        c.execute("UPDATE attendance SET check_out = ? WHERE name = ? AND date = ?", (now, name, today))
    elif act == 'start_break':
        if current_break_start:
            conn.close()
            return jsonify(success=False, message="Already on break. End break first.")
        break_history.append({'start': now, 'end': None})
        c.execute("UPDATE attendance SET current_break_start = ?, break_count = break_count + 1, break_history = ? WHERE name = ? AND date = ?", (now, json.dumps(break_history), name, today))
    elif act == 'end_break':
        if not current_break_start:
            conn.close()
            return jsonify(success=False, message="No active break to end")
        break_time = (datetime.fromisoformat(now) - datetime.fromisoformat(current_break_start)).total_seconds() / 60  # minutes
        break_history[-1]['end'] = now  # Update last break with end time
        c.execute("UPDATE attendance SET total_break = total_break + ?, current_break_start = NULL, break_history = ? WHERE name = ? AND date = ?", (break_time, json.dumps(break_history), name, today))
    elif act in ['upl', 'sl', 'al']:
        c.execute("UPDATE attendance SET leave_type = ? WHERE name = ? AND date = ?", (act.upper(), name, today))

    conn.commit()
    conn.close()
    return jsonify(success=True)

@app.route('/records')
def records():
    date = request.args.get('date', datetime.now(TZ).date().isoformat())
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT name, check_in, check_out, break_count, total_break, leave_type FROM attendance WHERE date = ? ORDER BY name", (date,))
    rows = c.fetchall()
    # Format timestamps for response
    formatted_rows = []
    for row in rows:
        check_in = datetime.fromisoformat(row[1]).strftime('%Y-%m-%d %H:%M:%S') if row[1] else None
        check_out = datetime.fromisoformat(row[2]).strftime('%Y-%m-%d %H:%M:%S') if row[2] else None
        total_break = round(row[4], 2) if row[4] is not None else 0.00
        formatted_rows.append([row[0], check_in, check_out, row[3], total_break, row[5] or None])
    conn.close()
    return jsonify(formatted_rows)

@app.route('/staff_history')
def staff_history():
    name = request.args.get('name')
    if not name:
        return jsonify([])
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT date, check_in, check_out, break_count, total_break, break_history, leave_type FROM attendance WHERE name = ? ORDER BY date DESC", (name,))
    rows = c.fetchall()
    # Format timestamps for response
    formatted_rows = []
    for row in rows:
        check_in = datetime.fromisoformat(row[1]).strftime('%Y-%m-%d %H:%M:%S') if row[1] else None
        check_out = datetime.fromisoformat(row[2]).strftime('%Y-%m-%d %H:%M:%S') if row[2] else None
        break_history = json.loads(row[5]) if row[5] else []
        formatted_breaks = []
        for b in break_history:
            start = datetime.fromisoformat(b['start']).strftime('%H:%M:%S') if b['start'] else 'N/A'
            end = datetime.fromisoformat(b['end']).strftime('%H:%M:%S') if b['end'] else 'N/A'
            formatted_breaks.append({'start': start, 'end': end})
        total_break = round(row[4], 2) if row[4] is not None else 0.00
        formatted_rows.append({
            'date': row[0],
            'check_in': check_in,
            'check_out': check_out,
            'break_count': row[3],
            'total_break': total_break,
            'break_history': formatted_breaks,
            'leave_type': row[6] or None
        })
    conn.close()
    return jsonify(formatted_rows)

if __name__ == '__main__':
    app.run(debug=True)