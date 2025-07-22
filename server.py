# server.py
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
from datetime import datetime, timedelta
import pytz
import json

app = Flask(__name__)
app.secret_key = 'your_secure_random_string_here'  # !!! CHANGE THIS TO A STRONG, UNIQUE KEY !!!

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
    "Raymond Ochinang", "Nan Sean Err", "LIV PHEAKDEY", "ART NEARDEY", "SENG CHHAYFOU",
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

# Helper function to format datetime objects for database storage and consistent display
def format_datetime_for_db(dt_obj):
    if dt_obj:
        # Format to YYYY-MM-DD HH:MM:SS. We handle timezone for actual `now` in actions
        # but store as naive string for simplicity with SQLite
        return dt_obj.strftime('%Y-%m-%d %H:%M:%S')
    return None

def parse_datetime_from_db(dt_str):
    if dt_str:
        try:
            # Parse as naive datetime, then localize if needed for calculations
            return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            # Fallback for ISO format if it somehow got saved
            return datetime.fromisoformat(dt_str)
    return None

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
        c.execute("INSERT INTO attendance (name, date, break_history) VALUES (?, ?, ?)", (name, date, json.dumps([])))
        conn.commit()
    conn.close()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
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
        return jsonify({'success': False, 'message': 'Admin access required'})
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'})

    name = data.get('name')
    date = data.get('date')
    field = data.get('field')
    value = data.get('value', '').strip()

    if not all([name, date, field]):
        return jsonify({'success': False, 'message': 'Missing required fields'})

    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    try:
        # Fetch current break_history for modification if needed
        c.execute("SELECT break_history, total_break FROM attendance WHERE name = ? AND date = ?", (name, date))
        current_data = c.fetchone()
        current_break_history = json.loads(current_data[0]) if current_data and current_data[0] else []
        current_total_break = current_data[1] if current_data and current_data[1] is not None else 0.0

        if field in ['check_in', 'check_out']:
            try:
                # Validate and parse the timestamp
                if value: # Allow clearing the field by sending an empty string
                    datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
                c.execute(f"UPDATE attendance SET {field} = ? WHERE name = ? AND date = ?", (value or None, name, date))
            except ValueError:
                conn.close()
                return jsonify({'success': False, 'message': f'Invalid datetime format for {field}. Use YYYY-MM-DD HH:MM:SS'})
        elif field == 'break_count':
            try:
                count = int(value)
                if count < 0: raise ValueError
                c.execute("UPDATE attendance SET break_count = ? WHERE name = ? AND date = ?", (count, name, date))
            except ValueError:
                conn.close()
                return jsonify({'success': False, 'message': 'Invalid value for break_count. Must be a non-negative integer.'})
        elif field == 'total_break':
            try:
                total_min = float(value)
                if total_min < 0: raise ValueError
                c.execute("UPDATE attendance SET total_break = ? WHERE name = ? AND date = ?", (total_min, name, date))
            except ValueError:
                conn.close()
                return jsonify({'success': False, 'message': 'Invalid value for total_break. Must be a non-negative number.'})
        elif field == 'leave_type':
            valid_leave_types = ['UPL', 'SL', 'AL', 'NONE', '']
            if value.upper() not in valid_leave_types:
                conn.close()
                return jsonify({'success': False, 'message': 'Invalid leave_type. Must be UPL, SL, AL, or None.'})
            c.execute("UPDATE attendance SET leave_type = ? WHERE name = ? AND date = ?", (value.upper() if value else None, name, date))
        elif field == 'break':
            break_index_str = data.get('break_index')
            subfield = data.get('subfield', '')

            if break_index_str is None or not subfield:
                return jsonify({'success': False, 'message': 'Missing break_index or subfield for break edit.'})

            try:
                break_index = int(break_index_str)
                if not (0 <= break_index < len(current_break_history)):
                    conn.close()
                    return jsonify({'success': False, 'message': 'Invalid break index.'})
            except ValueError:
                conn.close()
                return jsonify({'success': False, 'message': 'Break index must be an integer.'})

            if subfield not in ['start', 'end']:
                conn.close()
                return jsonify({'success': False, 'message': 'Invalid subfield for break (must be "start" or "end").'})

            try:
                # Value for break is just HH:MM:SS, combine with date for storage
                if value:
                    full_datetime_str = f"{date} {value}"
                    datetime.strptime(full_datetime_str, '%Y-%m-%d %H:%M:%S') # Validate format
                else: # Allow clearing specific break start/end
                    full_datetime_str = None

                current_break_history[break_index][subfield] = full_datetime_str
                
                # Re-calculate total_break and break_count after specific break edit
                recalculated_total_break = 0.0
                recalculated_break_count = 0
                for b in current_break_history:
                    if b.get('start') and b.get('end'):
                        start_dt = parse_datetime_from_db(b['start'])
                        end_dt = parse_datetime_from_db(b['end'])
                        if start_dt and end_dt:
                            recalculated_total_break += (end_dt - start_dt).total_seconds() / 60
                            recalculated_break_count += 1
                    elif b.get('start') and not b.get('end'): # Active break, count it but don't add to total_break yet
                        recalculated_break_count += 1
                        
                c.execute("UPDATE attendance SET break_history = ?, total_break = ?, break_count = ? WHERE name = ? AND date = ?",
                          (json.dumps(current_break_history), recalculated_total_break, recalculated_break_count, name, date))
            except ValueError:
                conn.close()
                return jsonify({'success': False, 'message': f'Invalid time format for break {subfield}. Use HH:MM:SS'})
            except Exception as e:
                conn.close()
                return jsonify({'success': False, 'message': f'Error updating break: {str(e)}'})

        conn.commit()
    except Exception as e:
        conn.rollback() # Rollback changes on error
        return jsonify({'success': False, 'message': f'Database error during update: {str(e)}'})
    finally:
        conn.close()
    return jsonify({'success': True})

@app.route('/')
def index():
    if 'user' not in session:
        return redirect(url_for('login'))
    today = datetime.now(TZ).date().isoformat()
    # Ensure all staff have a row for today
    for name in STAFF_NAMES:
        get_or_create_row(name, today)
    return render_template('index.html', staff_names=STAFF_NAMES, today=today, role=session.get('role', 'staff'))

@app.route('/action', methods=['POST'])
def action():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'})
    name = data.get('name')
    if not name or name not in STAFF_NAMES:
        return jsonify({'success': False, 'message': 'Invalid staff name'})
    act = data.get('action')
    if not act:
        return jsonify({'success': False, 'message': 'No action provided'})
    
    current_time_gmt7 = datetime.now(TZ)
    now_formatted = format_datetime_for_db(current_time_gmt7)
    today = current_time_gmt7.date().isoformat()

    get_or_create_row(name, today)

    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Fetch all relevant data in one go
    c.execute("SELECT check_in, check_out, current_break_start, break_count, total_break, break_history FROM attendance WHERE name = ? AND date = ?", (name, today))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return jsonify({'success': False, 'message': 'No record found after creation attempt.'})
        
    check_in_db, check_out_db, current_break_start_db, break_count_db, total_break_db, break_history_json = row

    break_history = json.loads(break_history_json) if break_history_json else []
    
    try:
        if act == 'check_in':
            if check_in_db: # If check_in exists
                if not check_out_db: # And check_out doesn't, they are already checked in
                    return jsonify({'success': False, 'message': 'Already checked in for today.'})
                else: # If both exist, it means they checked out previously today
                    return jsonify({'success': False, 'message': 'Already checked out for today. Cannot check in again for the same day.'})
            c.execute("UPDATE attendance SET check_in = ?, leave_type = NULL WHERE name = ? AND date = ?", (now_formatted, name, today))
        
        elif act == 'check_out':
            if not check_in_db:
                return jsonify({'success': False, 'message': 'Cannot check out. Staff not checked in yet.'})
            if check_out_db:
                return jsonify({'success': False, 'message': 'Already checked out for today.'})

            # If staff is currently on break, end the break first
            if current_break_start_db:
                start_break_dt = parse_datetime_from_db(current_break_start_db)
                if start_break_dt:
                    break_time_seconds = (current_time_gmt7 - TZ.localize(start_break_dt)).total_seconds() # Localize parsed time
                    total_break_db += (break_time_seconds / 60)
                
                # Update the last break in history
                if break_history and break_history[-1].get('end') is None:
                    break_history[-1]['end'] = now_formatted
                
                # Clear current_break_start and update total_break, break_history
                c.execute("UPDATE attendance SET total_break = ?, current_break_start = NULL, break_history = ?, check_out = ? WHERE name = ? AND date = ?",
                          (total_break_db, json.dumps(break_history), now_formatted, name, today))
            else:
                c.execute("UPDATE attendance SET check_out = ? WHERE name = ? AND date = ?", (now_formatted, name, today))
        
        elif act == 'start_break':
            if not check_in_db:
                return jsonify({'success': False, 'message': 'Cannot start break. Staff not checked in yet.'})
            if current_break_start_db:
                return jsonify({'success': False, 'message': 'Already on break. End break first.'})
            
            break_history.append({'start': now_formatted, 'end': None})
            c.execute("UPDATE attendance SET current_break_start = ?, break_count = break_count + 1, break_history = ? WHERE name = ? AND date = ?",
                      (now_formatted, json.dumps(break_history), name, today))
        
        elif act == 'end_break':
            if not current_break_start_db:
                return jsonify({'success': False, 'message': 'No active break to end.'})
            
            start_break_dt = parse_datetime_from_db(current_break_start_db)
            if not start_break_dt:
                return jsonify({'success': False, 'message': 'Could not parse break start time.'})

            # Calculate break duration using localized datetimes
            break_time_seconds = (current_time_gmt7 - TZ.localize(start_break_dt)).total_seconds()
            
            total_break_db += (break_time_seconds / 60) # Add to total break in minutes

            # Update the last break entry in break_history
            if break_history and break_history[-1].get('end') is None:
                break_history[-1]['end'] = now_formatted
            else:
                # This case should ideally not happen if current_break_start is present
                # but as a fallback, add a new entry or update the last.
                # For robustness, we ensure there's an active break entry.
                if not break_history or (break_history and break_history[-1].get('start') and break_history[-1].get('end')):
                    break_history.append({'start': 'N/A', 'end': now_formatted}) # Fallback
                else:
                    break_history[-1]['end'] = now_formatted

            c.execute("UPDATE attendance SET total_break = ?, current_break_start = NULL, break_history = ? WHERE name = ? AND date = ?",
                      (total_break_db, json.dumps(break_history), name, today))
        
        elif act in ['upl', 'sl', 'al']:
            if 'role' not in session or session['role'] != 'admin':
                return jsonify({'success': False, 'message': 'Only admin can set leave types.'})
            c.execute("UPDATE attendance SET leave_type = ? WHERE name = ? AND date = ?", (act.upper(), name, today))

        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error during action: {e}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'})
    finally:
        conn.close()
    return jsonify({'success': True})

@app.route('/records')
def records():
    date_str = request.args.get('date', datetime.now(TZ).date().isoformat())
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    # Select all required fields for daily records
    c.execute("SELECT name, check_in, check_out, break_count, total_break, leave_type FROM attendance WHERE date = ? ORDER BY name", (date_str,))
    rows = c.fetchall()
    
    formatted_rows = []
    for row in rows:
        name, check_in_db, check_out_db, break_count, total_break_min, leave_type = row
        
        # Format timestamps for display (if they exist)
        check_in_display = parse_datetime_from_db(check_in_db)
        check_out_display = parse_datetime_from_db(check_out_db)
        
        formatted_check_in = format_datetime_for_db(check_in_display)
        formatted_check_out = format_datetime_for_db(check_out_display)
        
        formatted_total_break = round(total_break_min, 2) if total_break_min is not None else 0.00
        formatted_leave_type = leave_type if leave_type else 'None'
        
        formatted_rows.append([
            name,
            formatted_check_in,
            formatted_check_out,
            break_count,
            formatted_total_break,
            formatted_leave_type
        ])
    conn.close()
    return jsonify(formatted_rows)

@app.route('/staff_history')
def staff_history():
    name = request.args.get('name')
    if not name:
        return jsonify({'error': 'No name provided'})
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute("SELECT date, check_in, check_out, break_count, total_break, break_history, leave_type, current_break_start FROM attendance WHERE name = ? ORDER BY date DESC", (name,))
    rows = c.fetchall()
    
    formatted_rows = []
    for row in rows:
        date_db, check_in_db, check_out_db, break_count_db, total_break_db, break_history_json, leave_type_db, current_break_start_db = row
        
        check_in_display = parse_datetime_from_db(check_in_db)
        check_out_display = parse_datetime_from_db(check_out_db)

        formatted_check_in = format_datetime_for_db(check_in_display)
        formatted_check_out = format_datetime_for_db(check_out_display)
        
        break_history_list = json.loads(break_history_json) if break_history_json else []
        formatted_breaks = []
        for b in break_history_list:
            start_time = parse_datetime_from_db(b.get('start'))
            end_time = parse_datetime_from_db(b.get('end'))
            
            formatted_breaks.append({
                'start': start_time.strftime('%H:%M:%S') if start_time else 'N/A',
                'end': end_time.strftime('%H:%M:%S') if end_time else 'N/A'
            })
            
        # If there's an active break not yet recorded in history's 'end', append it
        if current_break_start_db:
             # Check if the last break in history is still open for today's record
            if not formatted_breaks or formatted_breaks[-1]['end'] != 'N/A':
                 # This means current_break_start_db exists but no matching end in history (e.g. if edited manually or data inconsistency)
                 # Add a placeholder for an open break if the last one is closed
                pass # This is usually handled by the history list itself.
                     # The action() function handles adding the open break.
                     # This display logic specifically formats past breaks.
            
        formatted_total_break = round(total_break_db, 2) if total_break_db is not None else 0.00
        formatted_leave_type = leave_type_db if leave_type_db else 'None'

        formatted_rows.append({
            'date': date_db,
            'check_in': formatted_check_in,
            'check_out': formatted_check_out,
            'break_count': break_count_db,
            'total_break': formatted_total_break,
            'break_history': formatted_breaks,
            'leave_type': formatted_leave_type
        })
    conn.close()
    return jsonify(formatted_rows)

if __name__ == '__main__':
    app.run(debug=True)