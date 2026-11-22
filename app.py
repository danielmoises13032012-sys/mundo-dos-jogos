from flask import Flask, request, jsonify, send_from_directory, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import re

app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get("SECRET_KEY", "mude-esta-chave-antes-de-publicar-2026")
DB = os.path.join(os.path.dirname(__file__), "jogadores.db")

def ligar_db():
    con = sqlite3.connect(DB)
    con.execute("""CREATE TABLE IF NOT EXISTS jogadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL
    )""")
    con.commit()
    return con

@app.get("/")
def inicio():
    return send_from_directory(".", "index.html")

@app.get("/<path:nome>")
def ficheiros(nome):
    if nome in ("style.css", "script.js", "auth.js"):
        return send_from_directory(".", nome)
    return jsonify({"error": "Página não encontrada."}), 404

@app.post("/api/register")
def registar():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    if not re.fullmatch(r"[A-Za-z0-9_]{3,20}", username):
        return jsonify(error="O nome deve ter 3 a 20 caracteres: letras, números ou _.") , 400
    if len(password) < 8:
        return jsonify(error="A palavra-passe deve ter pelo menos 8 caracteres."), 400
    con = ligar_db()
    try:
        con.execute("INSERT INTO jogadores (username, password_hash) VALUES (?, ?)",
                    (username, generate_password_hash(password)))
        con.commit()
    except sqlite3.IntegrityError:
        con.close()
        return jsonify(error="Esse nome de jogador já está em uso."), 409
    con.close()
    session["username"] = username
    return jsonify(message="Conta criada com sucesso! Bem-vindo, " + username + ".")

@app.post("/api/login")
def entrar():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    con = ligar_db()
    row = con.execute("SELECT username, password_hash FROM jogadores WHERE username = ? COLLATE NOCASE",
                      (username,)).fetchone()
    con.close()
    if not row or not check_password_hash(row[1], password):
        return jsonify(error="Nome de jogador ou palavra-passe incorretos."), 401
    session["username"] = row[0]
    return jsonify(message="Sessão iniciada. Bem-vindo de volta, " + row[0] + ".")

@app.get("/api/me")
def minha_conta():
    username = session.get("username")
    return jsonify(logged_in=bool(username), username=username)

@app.post("/api/logout")
def sair():
    session.clear()
    return jsonify(message="Sessão terminada.")

if __name__ == "__main__":
    ligar_db().close()
    app.run(host="0.0.0.0", port=8001, debug=False)
