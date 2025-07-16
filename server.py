from flask import Flask, request, jsonify
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import datetime

app = Flask(__name__)

# Google Sheets setup
SCOPE = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
CREDENTIALS_FILE = "auto.json"  # Path to your JSON key file
SPREADSHEET_ID = "1Hd2TbGozRvRqJKpnpKa3CDF_X_V9wXNYt5aXivHbats"
SHEET_NAME = "Record"

try:
    creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, SCOPE)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SPREADSHEET_ID).worksheet(SHEET_NAME)
except Exception as e:
    print(f"Error initializing Google Sheets: {e}")
    raise

@app.route("/check-in", methods=["POST"])
def check_in():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ["name", "checkInTime", "action"]):
            return jsonify({"error": "Missing required fields"}), 400

        name = data["name"]
        check_in_time = data["checkInTime"]
        action = data["action"]
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Append to Google Sheet
        sheet.append_row([timestamp, name, action, check_in_time])
        return jsonify({"status": "success", "message": f"{action} recorded for {name}"}), 200
    except Exception as e:
        print(f"Error processing check-in: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/records", methods=["GET"])
def get_records():
    try:
        records = sheet.get_all_records()
        return jsonify(records), 200
    except Exception as e:
        print(f"Error fetching records: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)