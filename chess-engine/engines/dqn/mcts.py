import chess
import numpy as np
import math
from nnet import BoardEncoder

class MCTS:

    def __init__(self, board, nnet):
        self.board = board
        self.nnet = nnet

        self.Ns = {}    # stores #times board s was visited
        self.Nsa = {}   # stores #times edge (s,a) was visited
        self.Wsa = {}   # stores total action value for edge (s,a)
        self.Qsa = {}   # stores average action value for edge (s,a)
        self.Psa = {}   # stores prior probability returned by neural net
        self.Vs = {}    # stores valid moves for state s

        self.boardEncoder = BoardEncoder()

        # hyper parameters
        self.numMCTSsims = 50

    def getActionProb(self, temp=1):
        # this function performs numMctsSims simulations
        # returns:
        #   probs: a policy vector where the probability of the ith action
        #           is proportional to Nsa[(s,a)]**(1/temp)
        s = self.board.fen()

        for i in range(self.numMCTSsims):
            self.search(self.board.copy())

        counts = [self.Nsa[(s, a)] if (s, a) in self.Nsa else 0 for a in range(self.board.legal_moves)]

        if temp == 0:
            bestA = np.argmax(counts)
            probs = [0] * len(counts)
            probs[bestA] = 1
            return probs

        counts = [x**(1./temp) for x in temp]
        probs = [x / float(sum(counts)) for x in counts]
        return probs

    def search(self, board):
        '''
        This function performs one iteration of MCTS. It is recursively called
        till a leaf node is found. The action chosen at each node is one that has
        the maximum upper confidence bound.

        Once a leaf node is found, 2 options:
        1) leaf node is a terminal node; in that case, calculate the score
        2) leaf node is not terminal node; in that case the neural network is called
            to return an initial policy P(s,a) and a value v for the state.

        In both cases, value is propagated up the search path.
        The values of Ns, Nsa, Wsa and Qsa are then updated.

        Note: the values are the negative of the values of the current state.
        This is done since v in [-1; 1], and if v is the value of a state for
        the current player, then its value is -v for the other player.

        Returns:
            v: the negative of the value of the current board
        '''

        s = board.fen()

        # terminal node
        # ******************************************************
        if board.is_game_over():
            if board.is_check_mate():
                if board.turn == chess.WHITE:
                    r = -1
                else:
                    r = 1
            else:
                r = 0
            return (-1) * r

        # leaf node
        # ******************************************************
        if s not in self.Ns:
            # leaf node
            encodedBoard = self.boardEncoder.EncodeBoard(board)
            probas, v = self.nnet.forward(encodedBoard)
            probas = probas.data.numpy()
            v = v.data.numpy()

            # get legal moves with probabilities
            move_probas = self.boardEncoder.DecodeLegalMovesProbas(board, probas)


            sum_Ps = np.sum(self.Ps[s])
            if sum_Ps > 0:
                self.Ps[s] /= sum_Ps    # re-normalize
            else:
                # if all moves were masked, make all valid moves equally probable
                # NB: all valid moves may be masked if nnet architecture is insufficient or if overfitting
                print("All valid moves were masked")
                self.Ps[s] = self.Ps[s] + mask
                self.Ps[s] /= np.sum(self.Ps[s])
            self.Vs[s] = self.boardEncoder.DecodeMoves(mask)
            self.Ns[s] = 0
            return -v

        valid_moves = self.Vs[s]
        cur_best = -float('inf')
        best_act = -1

        # pick the action with the highest upper confidence bound
        cpuct = 1.0
        for a in valid_moves:
            if (s, a) in self.Qsa:
                u = self.Qsa[(s, a)] + cpuct * self.Ps[s][a] * math.sqrt(self.Ns[s]) / (1 + self.Nsa[(s, a)])
            else:
                u = cpuct * self.Ps[s][a] * math.sqrt(self.Ns[s] + 1e-8)

            if u > best_act:
                cur_best = u
                best_act = a

        a = best_act
        board.push(a)

        v = self.search(board)

        if (s,a) in self.Qsa:
            self.Qsa[(s, a)] = (self.Nsa[(s, a)]*self.Qsa[(s, a)] + v)/(self.Nsa[(s, a)] + 1)
            self.Nsa[(s, a)] += 1
        else:
            self.Qsa[(s, a)] = v
            self.Nsa[(s, a)] = 1

        self.Ns[s] += 1
        return -v
