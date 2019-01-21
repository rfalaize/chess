import chess
import random
import logging
import connexion
from datetime import datetime
from flask import make_response, abort, jsonify

def decode_fen(fen):
    return fen.replace('_', ' ')

# Create a handler for compute (POST)
def compute(context):
    headers = {}
    headers['user'] = connexion.request.headers.get('User-Agent')
    headers['host'] = connexion.request.headers.get('Host')
    fen = context.get("fen", None)
    response = {}
    startTime = datetime.now()

    try:
        decoded_fen = decode_fen(fen)
        board = chess.Board(decoded_fen)
        move = random.choice(list(board.legal_moves))
        board.push(move)
        response['status'] = 'success'
        response['move'] = str(move)
        response['board'] = board.fen()
        response['isCheckMate'] = board.is_checkmate()

    except Exception as e:
        response['status'] = 'error'
        response['message'] = str(e)

    endTime = datetime.now()
    elapsedTime = (endTime - startTime).total_seconds()
    stats = { 'startTime': startTime, 'endTime': endTime, 'elapsedTime': elapsedTime}
    response['stats'] = stats
    #response.headers.add('Access-Control-Allow-Origin', '*')
    logging.info("Request from " + str(headers) +"; response=" + str(response))

    return make_response(jsonify(response), 201)
