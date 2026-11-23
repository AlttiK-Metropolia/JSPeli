import json
from pathlib import Path

from flask import Flask, jsonify, send_from_directory

BASE_DIR = Path(__file__).parent.parent

app = Flask(__name__)


# Etusivu
@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


# Palauttaa eventit JSON-muodossa
@app.route("/api/events")
def events():
    with open(BASE_DIR / "events.json", encoding="utf-8") as f:
        return jsonify(json.load(f))


# Muut tiedostot
@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)