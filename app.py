from flask import Flask, request, jsonify, send_from_directory
import math
from scipy.stats import norm
import os

app = Flask(__name__)

# Serve index.html
@app.route("/")
def serve_index():
    return send_from_directory(os.getcwd(), "index.html")

# Serve CSS
@app.route("/style.css")
def serve_css():
    return send_from_directory(os.getcwd(), "style.css")

# Serve JS
@app.route("/script.js")
def serve_js():
    return send_from_directory(os.getcwd(), "script.js")

# Black-Scholes calculation API
def black_scholes(S, K, T, r, sigma):
    if T <= 0 or sigma <= 0:
        return None, None

    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)

    call = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    put = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

    return round(call, 4), round(put, 4)

@app.route("/api/calc", methods=["POST"])
def calculate():
    data = request.get_json()
    try:
        S = float(data["S"])
        K = float(data["K"])
        T = float(data["T"])
        r = float(data["r"])
        sigma = float(data["sigma"])
    except:
        return jsonify({"error": "Invalid input"}), 400

    call, put = black_scholes(S, K, T, r, sigma)

    if call is None:
        return jsonify({"error": "T and sigma must be > 0"}), 400

    return jsonify({"call": call, "put": put})

@app.route("/api/spot-strike-heatmap", methods=["POST"])
def spot_strike_heatmap():
    data = request.get_json()

    try:
        S0 = float(data["S"])
        K0 = float(data["K"])
        T = float(data["T"])
        r = float(data["r"])
        sigma = float(data["sigma"])
    except:
        return jsonify({"error": "Invalid input"}), 400

    spots = list(range(int(S0 - 10), int(S0 + 11)))
    strikes = list(range(int(K0 - 10), int(K0 + 11)))

    call_matrix = []
    put_matrix = []

    for K in strikes:
        call_row = []
        put_row = []
        for S in spots:
            call, put = black_scholes(S, K, T, r, sigma)
            call_row.append(call if call is not None else 0)
            put_row.append(put if put is not None else 0)
        call_matrix.append(call_row)
        put_matrix.append(put_row)

    return jsonify({
        "spots": spots,
        "strikes": strikes,
        "call_prices": call_matrix,
        "put_prices": put_matrix
    })

if __name__ == "__main__":
    app.run(debug=True)
