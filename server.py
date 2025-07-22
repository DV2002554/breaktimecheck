from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
from datetime import datetime
import pytz
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change to a secure key in production

# Hardcoded users
USERS = {
    "AdminDV1": {"password": "Welcome2", "role": "admin"},
    "familyBV": {"password": "Welcome1", "role": "staff"}
}

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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in USERS and USERS[username]['password'] == password:
            session['user'] = username
            session['role'] = USERS[username]['role']
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error="Invalid credentials")
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('role', None)
    return redirect(url_for('login'))

@app.route('/edit', methods=['POST'])
def edit():
    if 'role' not in session or session['role'] != 'admin':
        return jsonify(success=False, message="Admin access required")
    data = request.json
    name = data['name']
    date = data['date']
    field = data['field']
    value = data['value'].strip()  # Strip whitespace to prevent invalid ISO format

    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    try:
        if field == 'check_in' or field == 'check_out':
            # Validate datetime format before updating
            datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
            c.execute(f"UPDATE attendance SET {field} = ? WHERE name = ? AND date = ?", (value, name, date))
        elif field == 'break_count':
            c.execute("UPDATE attendance SET break_count = ? WHERE name = ? AND date = ?", (int(value), name, date))
        elif field == 'total_break':
            c.execute("UPDATE attendance SET total_break = ? WHERE name = ? AND date = ?", (float(value), name, date))
        elif field == 'leave_type':
            c.execute("UPDATE attendance SET leave_type = ? WHERE name = ? AND date = ?", (value, name, date))
        elif field == 'break':
            break_index = int(data['break_index'])  # Convert to int
            subfield = data['subfield']
            c.execute("SELECT break_history FROM attendance WHERE name = ? AND date = ?", (name, date))
            row = c.fetchone()
            break_history = json.loads(row[0]) if row[0] else []
            if 0 <= break_index < len(break_history):
                break_history[break_index][subfield] = value
                c.execute("UPDATE attendance SET break_history = ? WHERE name = ? AND date = ?", (json.dumps(break_history), name, date))
    except ValueError as e:
        conn.close()
        return jsonify(success=False, message=f"Invalid value for {field}: {str(e)}")
    conn.commit()
    conn.close()
    return jsonify(success=True)

@app.route('/')
def index():
    if 'user' not in session:
        return redirect(url_for('login'))
    today = datetime.now(TZ).date().isoformat()
    for name in STAFF_NAMES:
        get_or_create_row(name, today)
    return render_template('index.html', staff_names=STAFF_NAMES, today=today, role=session.get('role', 'staff'))

@app.route('/action', methods=['POST'])
def action():
    data = request.json
    name = data['name']
    if name not in STAFF_NAMES:
        return jsonify(success=False, message="Invalid staff name")
    act = data['action']
    now = datetime.now(TZ).isoformat()
    today = datetime.now(TZ).date().isoformat()

    get_or_create_row(name, today)

    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
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
        break_time = (datetime.fromisoformat(now) - datetime.fromisoformat(current_break_start)).total_seconds() / 60
        break_history[-1]['end'] = now
        c.execute("UPDATE attendance SET total_break = total_break + ?, current_break_start = NULL, break_history = ? WHERE name = ? AND date = ?", (break_time, json.dumps(break_history), name, today))
    elif act in ['upl', 'sl', 'al']:
        if 'role' in session and session['role'] == 'admin':
            c.execute("UPDATE attendance SET leave_type = ? WHERE name = ? AND date = ?", (act.upper(), name, today))
        else:
            conn.close()
            return jsonify(success=False, message="Only admin can set leave types")

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
    # Format timestamps for response, handling potential invalid formats
    formatted_rows = []
    for row in rows:
        check_in = row[1].strip() if row[1] else None
        check_out = row[2].strip() if row[2] else None
        try:
            check_in = datetime.strptime(check_in, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S') if check_in else None
            check_out = datetime.strptime(check_out, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S') if check_out else None
        except ValueError:
            try:
                check_in = datetime.fromisoformat(check_in).strftime('%Y-%m-%d %H:%M:%S') if check_in else None
                check_out = datetime.fromisoformat(check_out).strftime('%Y-%m-%d %H:%M:%S') if check_out else None
            except ValueError:
                check_in = None
                check_out = None
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
        check_in = row[1].strip() if row[1] else None
        check_out = row[2].strip() if row[2] else None
        try:
            check_in = datetime.strptime(check_in, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S') if check_in else None
            check_out = datetime.strptime(check_out, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S') if check_out else None
        except ValueError:
            check_in = None
            check_out = None
        break_history = json.loads(row[5]) if row[5] else []
        formatted_breaks = []
        for b in break_history:
            start = b['start'].strip() if b['start'] else 'N/A'
            end = b['end'].strip() if b['end'] else 'N/A'
            try:
                start = datetime.strptime(start, '%Y-%m-%d %H:%M:%S').strftime('%H:%M:%S') if start != 'N/A' else 'N/A'
                end = datetime.strptime(end, '%Y-%m-%d %H:%M:%S').strftime('%H:%M:%S') if end != 'N/A' else 'N/A'
            except ValueError:
                pass
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