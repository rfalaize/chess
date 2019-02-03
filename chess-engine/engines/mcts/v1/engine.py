from ...core import CoreEngine
import numpy as np
import datetime
import random

# ********************************************************************
# Node of the game tree
# ********************************************************************
class Node:

    def __init__(self, board):
        # current board position of the board
        self.board = board
        # statistics to keep for training
        self.visits = 0
        self.score = 0
        self.min_score = 0
        self.max_score = 0
        self.descendants = []

    def get_descendants(self):
        # return descendants of this node, i.e nodes reachable after each each legal move
        if len(self.descendants) == 0:
            # initialize child nodes
            if not self.is_leaf():
                for move in self.board.legal_moves:
                    descendant_board = self.board.copy()
                    descendant_board.push(move)
                    descendant_node = Node(descendant_board)
                    self.descendants.append(descendant_node)
        return self.descendants

    def is_leaf(self):
        return self.board.is_game_over()

    def copy(self):
        copy_board = self.board.copy()
        copy_node = Node(copy_board)
        copy_node.visits = self.visits
        copy_node.score = self.score
        copy_node.descendants = self.get_descendants()
        return copy_node


# ********************************************************************
# Monte carlo tree search engine
# ********************************************************************
class Engine(CoreEngine):

    def __init__(self):
        CoreEngine.__init__(self, 'mcts.v1')

        # Constants
        self.MAX_SCORE = 2000                       # value of the king
        self.SIGMOID_SCALING = self.MAX_SCORE / 5   # so that sigmoid(king)~0.99

        # *************************************************
        # piece square table evaluation
        # source: https://www.chessprogramming.org/Simplified_Evaluation_Function
        # *************************************************
        self.SCORES = {True: {}, False:{}}

        self.SCORES[True]['PAWN'] = \
            [0, 0, 0, 0, 0, 0, 0, 0,
             5, 10, 10, -20, -20, 10, 10, 5,
             5, -5, -10, 0, 0, -10, -5, 5,
             0, 0, 0, 20, 20, 0, 0, 0,
             5, 5, 10, 25, 25, 10, 5, 5,
             0, 0, 0, 20, 20, 0, 0, 0,
             10, 10, 20, 30, 30, 20, 10, 10,
             50, 50, 50, 50, 50, 50, 50, 50,
             0, 0, 0, 0, 0, 0, 0, 0]

        self.SCORES[True]['KNIGHT'] = \
            [-50, -40, -30, -30, -30, -30, -40, -50,
            -40, -20, 0, 0, 0, 0, -20, -40,
            -30, 0, 10, 15, 15, 10, 0, -30,
            -30, 0, 15, 20, 20, 15, 0, -30,
            -30, 0, 15, 20, 20, 15, 0, -30,
            -30, 0, 10, 15, 15, 10, 0, -30,
            -40, -20, 0, 0, 0, 0, -20, -40,
            -50, -40, -30, -30, -30, -30, -40, -50]

        self.SCORES[True]['BISHOP'] = \
            [-20, -10, -10, -10, -10, -10, -10, -20,
            -10, 5, 0, 0, 0, 0, 5, -10,
            -10, 10, 10, 10, 10, 10, 10, -10,
            -10, 0, 10, 10, 10, 10, 0, -10,
            -10, 5, 5, 10, 10, 5, 5, -10,
            -10, 0, 5, 10, 10, 5, 0, -10,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -20, -10, -10, -10, -10, -10, -10, -20]

        self.SCORES[True]['ROOK'] = \
            [0, 0, 0, 0, 0, 0, 0, 0,
            5, 10, 10, 10, 10, 10, 10, 5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            0, 0, 0, 5, 5, 0, 0, 0]

        self.SCORES[True]['QUEEN'] = \
            [-20, -10, -10, -5, -5, -10, -10, -20,
            -10, 0, 5, 0, 0, 0, 0, -10,
            -10, 5, 5, 5, 5, 5, 0, -10,
            -5, 0, 5, 5, 5, 5, 0, -5,
            0, 0, 5, 5, 5, 5, 0, -5,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -20, -10, -10, -5, -5, -10, -10, -20]

        self.SCORES[True]['KING'] = \
            [20, 30, 10, 0, 0, 10, 30, 20,
             20, 20, 0, 0, 0, 0, 20, 20,
             -10, -20, -20, -20, -20, -20, -20, -10,
             -20, -30, -30, -40, -40, -30, -30, -20,
             -30, -40, -40, -50, -50, -40, -40, -30,
             -30, -40, -40, -50, -50, -40, -40, -30,
             -30, -40, -40, -50, -50, -40, -40, -30,
             -30, -40, -40, -50, -50, -40, -40, -30]

        # mirror score tables for black
        self.SCORES[False]['PAWN'] = self.MirrorScore(self.SCORES[True]['PAWN'])
        self.SCORES[False]['KNIGHT'] = self.MirrorScore(self.SCORES[True]['KNIGHT'])
        self.SCORES[False]['BISHOP'] = self.MirrorScore(self.SCORES[True]['BISHOP'])
        self.SCORES[False]['ROOK'] = self.MirrorScore(self.SCORES[True]['ROOK'])
        self.SCORES[False]['QUEEN'] = self.MirrorScore(self.SCORES[True]['QUEEN'])
        self.SCORES[False]['KING'] = self.MirrorScore(self.SCORES[True]['KING'])

        # piece values
        self.piece_scores = {1: 100, 2: 320, 3: 330, 4: 500, 5: 900, 6: self.MAX_SCORE}

        # monte carlo tree search variables
        # *****************************************************************************
        self.root_node_player = True
        # hyper parameters
        self.max_search_time = 10       # in seconds
        self.C = 1.0                    # can be increase to favor exploration
        self.max_tree_searches = 0      # maximum tree searches
        self.max_selection_depth = 10   # limit the selection depth
        self.max_simulation_depth = 10  # limit the simulation depth
        # metrics to keep traversing the tree
        self.stats = {}
        # list of nodes followed during one round of simulation
        self.tree_search_branch = []
        # initial turn
        self.root_node_player = True

        return

    def MirrorScore(self, scores):
        return scores[56:64] \
               + scores[48:56] \
               + scores[40:48] \
               + scores[32:40] \
               + scores[24:32] \
               + scores[16:24] \
               + scores[8:16] \
               + scores[0:8]

    def Step(self):
        # function to be implemented by children
        root_node = Node(self.board)
        move, stats = self.MCTS(root_node, C=1.0,
                                max_tree_searches=200,
                                max_search_time=0,
                                max_selection_depth=3,
                                max_simulation_depth=1)
        self.board.push(move)
        return move, self.board, stats

    def Evaluate(self, board):
        # evaluation function
        if board.is_checkmate():
            if board.turn:
                return 1
            else:
                return 0
        elif board.is_game_over():
            # if game ended without checkmate, then it's a draw
            return 0.5

        score = 0
        for square in range(64):
            piece = board.piece_at(square)
            if piece is None:
                continue
            if piece.piece_type == 1:
                piece_score = self.piece_scores[1] + self.SCORES[piece.color]['PAWN'][square]
            elif piece.piece_type == 2:
                piece_score = self.piece_scores[2] + self.SCORES[piece.color]['KNIGHT'][square]
            elif piece.piece_type == 3:
                piece_score = self.piece_scores[3] + self.SCORES[piece.color]['BISHOP'][square]
            elif piece.piece_type == 4:
                piece_score = self.piece_scores[4] + self.SCORES[piece.color]['ROOK'][square]
            elif piece.piece_type == 5:
                piece_score = self.piece_scores[5] + self.SCORES[piece.color]['QUEEN'][square]
            elif piece.piece_type == 6:
                piece_score = self.piece_scores[6] + self.SCORES[piece.color]['KING'][square]

            if piece.color:
                # white
                score += piece_score
            else:
                # black
                score -= piece_score

        # squash score between 0 (black winning) and 1 (white winning)
        score_scaled = 1 / (1+np.exp((-1) * score / self.SIGMOID_SCALING))
        if not self.root_node_player:
            # if black plays at root node, return mirrored scored
            score_scaled = 1 - score_scaled
        return score_scaled

    def MCTS(self, root_node, C=1.0, max_tree_searches=0, max_search_time=30, max_simulation_depth=10, max_selection_depth=10):
        st = datetime.datetime.now()
        self.root_node_player = root_node.board.turn
        self.max_tree_searches = max_tree_searches
        self.max_search_time = max_search_time
        self.C = C
        self.max_simulation_depth = max_simulation_depth
        self.max_selection_depth = max_selection_depth

        print("White to play?", self.root_node_player)
        tree_search_count = 0

        while True:
            # ####################################################################
            # one round of tree search
            # ####################################################################
            # start each search from the root node
            current_node = root_node
            # list of visited nodes during selection,expansion,backup
            self.tree_search_branch = [current_node]

            tree_search_count += 1
            if (self.max_tree_searches > 0) and (tree_search_count > self.max_tree_searches):
                break
            # print("----------------------------------------------")
            #if tree_search_count % 100 == 0:
            print("tree search", tree_search_count, "...")

            # 1) Selection
            # ********************************************************************
            while current_node.visits > 0:

                if current_node.is_leaf():
                    # leaf found during selection; no need to expand
                    break

                if len(self.tree_search_branch) >= self.max_selection_depth:
                    # max selection depth reached
                    break

                best_ucb = -np.inf
                best_descendant = None

                for descendant in current_node.get_descendants():
                    # calculate upper confidence bound of each descendant
                    if descendant.visits > 0:
                        is_new_node = False
                        ucb_exploitation = descendant.score / descendant.visits
                        ucb_exploration = self.C * np.sqrt(2 * np.log(current_node.visits) / descendant.visits)
                        ucb = ucb_exploitation + ucb_exploration
                        if ucb > best_ucb:
                            best_ucb = ucb
                            best_descendant = descendant

                    else:
                        # node has never been visited before, so we have to pick it
                        best_descendant = descendant
                        is_new_node = True
                        ucb = 999999
                        ucb_exploitation = 0
                        ucb_exploration = 999999

                    if current_node.board.fen() == "rnbqkb1r/pppppppp/8/8/4n3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 3":
                        print("      |--> node",
                          ", ucb=", "{0:.3f}".format(ucb),
                          ", exploit=", "{0:.3f}".format(ucb_exploitation),
                          ", explore=", "{0:.3f}".format(ucb_exploration),
                          ", score=", "{0:.3f}".format(descendant.score),
                          ", visits=", descendant.visits,
                          ", last move=", descendant.board.peek(),
                          ", last player", not descendant.board.turn)

                    if is_new_node:
                        break

                # go down to the selected descendant node
                current_node = best_descendant

                # 2) Expansion
                # ********************************************************************
                # print("    expansion", current_node.board.peek())
                self.tree_search_branch += [current_node]

            # 3) Simulation
            # ********************************************************************
            # start simulation from the first unexplored node (i.e. the current_node)
            # create a simulation branch from there
            # this branch is not stored as we are only interested about the end result, i.e the leaf.
            # note: this could be stored for further use although it would consume much more memory
            simulated_branch_depth = 0

            simulated_node = current_node.copy()
            while not simulated_node.is_leaf():
                # select next node in a random manner (light play out)
                # note: here can incorporate knowledge of the game to guide the search
                # for example following probabilities given by a trained DQN policy
                simulated_node = random.choice(simulated_node.get_descendants())
                simulated_branch_depth += 1
                if simulated_branch_depth >= self.max_simulation_depth:
                    # stop simulation after max depth to inc
                    break
                # at the end of this loop, simulation_node is far down the tree

            # 4) Back propagation
            # ********************************************************************
            # update all nodes visited during the tree search (not during the simulation)
            score = self.Evaluate(simulated_node.board)
            # print("    simulation: depth", simulated_branch_depth, ", score=", score)
            for visited_node in self.tree_search_branch:
                visited_node.visits += 1
                visited_node.score += score
            # print("    back prop:", len(self.tree_search_branch), "nodes updated")

            if tree_search_count % 100 == 0:
                tree_stats = ''
                for node in self.tree_search_branch:
                    tree_stats += '[{}/{}] '.format("{0:.3f}".format(node.score), node.visits)
                print("    >> {}".format(tree_stats))

            # check if there is time left
            # ********************************************************************
            if self.max_search_time > 0 and (tree_search_count % 10) == 0:
                et = datetime.datetime.now()
                elapsed_time = (et - st).total_seconds()
                if elapsed_time > self.max_search_time:
                    print("elapsed time > max search time => stop tree search")
                    break

        # ####################################################################
        # 5) Move selection
        # ####################################################################
        max_visits = -1
        next_node = None

        print("******************** End search. Next move selection *******************")
        for descendant in root_node.get_descendants():
            print("node", descendant.board.peek(),
                  ", visits", descendant.visits,
                  ", score", descendant.score/max(descendant.visits, 1))
            if descendant.visits > max_visits:
                max_visits = descendant.visits
                next_node = descendant
        print("******************** End *******************")

        et = datetime.datetime.now()
        self.stats['search_time'] = (et - st).total_seconds()
        self.stats['tree_search_count'] = tree_search_count
        self.stats['node_visits'] = next_node.visits
        self.stats['node_avg_score'] = next_node.score / max(descendant.visits, 1)
        next_move = next_node.board.peek()
        print("next move", next_move)
        return next_move, self.stats



# request handler
def handleRequest(context):
    engine = Engine()
    return engine.HandlePostRequest(context)