'''
Core Engine is the parent class of all chess engines.

Children engines inherit from it and call the GenerateMove function to return a move.
GenerateMove takes a 'compute' function as input, which is implemented by the children.
GenerateMove wraps the call to 'compute' and adds standard metrics to the results (elapsed time... etc).
'''

import chess
import logging
import connexion
from datetime import datetime
from flask import make_response, abort, jsonify

class CoreEngine:

    def __init__(self, engineName='core'):
        self.board = chess.Board()
        self.engineName = engineName
        return

    def DecodeFen(self, fen):
        return fen.replace('_', ' ')

    def HandlePostRequest(self, request):
        headers = {}
        headers['user'] = connexion.request.headers.get('User-Agent')
        headers['host'] = connexion.request.headers.get('Host')
        fen = request.get("fen", None)
        response = {}
        startTime = datetime.now()

        try:
            decoded_fen = self.DecodeFen(fen)
            self.board = chess.Board(decoded_fen)

            # search next move using the specified 'Compute' function
            logging.info("Step... engine=" + self.engineName)
            move, board, stats = self.Step()
            endTime = datetime.now()
            elapsedTime = (endTime - startTime).total_seconds()
            logging.info("Step took " + str(elapsedTime) + 's for engine ' + self.engineName)

            # return response
            response['status'] = 'success'
            response['move'] = str(move)
            response['board'] = board.fen()
            response['input'] = decoded_fen
            response['isCheckMate'] = board.is_checkmate()

        except Exception as e:
            endTime = datetime.now()
            elapsedTime = (endTime - startTime).total_seconds()
            response['status'] = 'error'
            response['message'] = str(e)
            stats = {}
            logging.error(e)


        core_stats = { 'startTime': startTime, 'endTime': endTime, 'elapsedTime': elapsedTime}
        response['stats'] = {**stats, **core_stats} # join 2 dictionaries
        logging.info("Request from " + str(headers) +"; response=" + str(response))

        return make_response(jsonify(response), 201)

    def Step(self):
        # function to be implemented by children
        # move = ''
        # return move, self.board <-- return format
        raise NotImplementedError
