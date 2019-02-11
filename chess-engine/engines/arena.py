'''
Arena class to pit models against each other
'''

import chess
# from pytorch_classification.utils import Bar, AverageMeter
import numpy as np
import multiprocessing as mp
import datetime

class Arena:

    def __init__(self, player1, player2):
        # player 1, 2: function that takes a board as input, return an action
        self.player1 = player1
        self.player2 = player2
        self.board = None
        return

    def PlayGame(self, verbose=False):
        '''
        Executes one episode of the game. Returns
         +1 if player1 won
         -1 if player2 won
          0 otherwise
        '''
        players = {True: self.player1, False: self.player2}
        cur_player = True
        self.board = chess.Board()
        i = 0
        while not self.board.is_game_over():
            i += 1
            if verbose:
                print("-------- turn", str(i), "player", str(cur_player), "-------- turn")
                # print(self.board)
            # get action
            players[cur_player].board = self.board
            move, board, _ = players[cur_player].Step()
            # move on to next player
            cur_player = not cur_player

        results = {}
        result = 0
        if self.board.is_checkmate():
            if self.board.turn:
                result = -1
            else:
                result = 1
        if verbose:
            print("game over: turn=", str(i), "result=", str(result), "moves=", self.board.move_stack)
            print(self.board)
        results['score'] = result
        results['moves'] = self.board.move_stack
        return results


# play multiple games
def PlayTournament(player1, player2, num_games):
    # spawn 1 process per core, i.e use 100% cpu capacity
    st = datetime.datetime.now()
    num_cores = min(mp.cpu_count(), num_games)
    print("****************** START ******************")
    print("player1=", player1.engineName, " VS player2=", player2.engineName)
    print("play", num_games, "games on", num_cores, "parallel cores...")
    pool = mp.Pool(processes=num_cores)
    # create arenas
    arenas = [Arena(player1.Copy(), player2.Copy()) for x in range(num_games)]
    results = [pool.apply(arena.PlayGame, args=()) for arena in arenas]
    et = datetime.datetime.now()
    total_time = (et - st).total_seconds()
    print("finished in", total_time, "s")
    print("results:")
    final_score = 0
    for result in results:
        final_score += result['score']
        print("score=", result['score'], "; moves=", [str(x) for x in result['moves']])
    final_score /= len(results)
    print("player1 won {0:.0%}".format(final_score))
    print("****************** END ******************")
    return final_score
