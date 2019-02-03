'''
************************************************************************************************************
Monte carlo tree search
************************************************************************************************************
MCTS is efficient for finding the best possible move from a given node, under time constraint.
Starting from the root node n(0), we repeat the following steps until time is exhausted:

1) Selection:
    From the current node, choose the action (out a set of possible actions) that maximizes the Upper Confidence Bound (UCB).
    UCB(k,p) =      E[w(k)/n(k)]     +     C*SQRT(2*ln[n(k-1)]/n(k))
                    # exploitation   +     # exploration
    with
    - w(k): total score accumulated in descendant nodes (number of wins for chess)
    - n(k): total number of visits for this node
    - n(k-1): total number of visits for the parent node
    - C: hyper-parameter that can be increased to favor exploration.
    Basically the exploration term is higher when a node hasn't been explored.

    ----------------------------------------------------------------------------------------------------------
    => Repeat step (1) until reaching a node that haven't been explored.

2) Expansion:
    Once a new node is reached, create it with
    w(*) = 0
    n(*) = 0

3) Simulation:
    From the newly created node, generate RANDOM moves until a leaf node is reached.
    Calculate the score (S) for that leaf node: WIN=+1, LOSE=-1, DRAW=0.
    The idea here is to go fast and sample an end-game value for the newly created node.
    Note: new nodes are expanded in this process, however in practice they are not added to the tree.

4) Back-up:
    Propagate the end-game result back up the tree. For each node on the upward path from n(*) to n(0),
    increment the counter values:
    w(*) += S
    n(*) += 1

    ----------------------------------------------------------------------------------------------------------
    => Repeat steps (1-4) until time is exhausted.

5) Finally, Pick an action from state n(0)
    In practice the action with the highest visit counts is selected.
    Action that maximize the expected result w(k)/n(k) could be selected, however this could be misleading
    if the node is bad but hasn't been evaluated a lot, i.e it's bad outputs haven't been discovered.

'''

import datetime
from math import sqrt, log, inf
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

    def calculate_score(self):
        if self.board.is_checkmate():
            if self.board.turn:
                # white was checkmated
                self.score = 0
            else:
                # black was checkmated
                self.score = 1
        elif self.board.is_game_over():
            # draw
            self.score = 0.5

        # we can use a heuristic function here to further guide evaluation
        # ...

        return self.score

    def copy(self):
        copy_board = self.board.copy()
        copy_node = Node(copy_board)
        copy_node.visits = self.visits
        copy_node.score = self.score
        copy_node.descendants = self.get_descendants()
        return copy_node


# ********************************************************************
# Monte carlo tree search implementation
# ********************************************************************
class MCTS:

    def __init__(self, max_search_time=10, C=1.0, max_selection_depth=20, max_simulation_depth=300):
        # hyper parameters
        self.max_search_time = max_search_time                      # in seconds
        self.C = C                                                  # can be increase to favor exploration
        self.max_selection_depth = max_selection_depth              # limit the selection depth
        self.max_simulation_depth = max_simulation_depth            # limit the simulation depth
        # metrics to keep traversing the tree
        self.stats = {}
        # list of nodes followed during one round of simulation
        self.tree_search_branch = []
        # initial turn
        self.root_node_player = True

    def search(self, root_node):
        st = datetime.datetime.now()
        self.root_node_player = root_node.board.turn
        print("White to play:", self.root_node_player)
        simulations_count = 0

        while True:
            # ####################################################################
            # one round of tree search
            # ####################################################################
            # start each search from the root node
            current_node = root_node
            # list of visited nodes during selection,expansion,backup
            self.tree_search_branch = [current_node]

            print("simulation", simulations_count, "...")

            # 1) Selection
            # ********************************************************************
            while current_node.visits > 0:

                if current_node.is_leaf():
                    # leaf found during selection; no need to expand
                    break

                if len(self.tree_search_branch) >= self.max_selection_depth:
                    # max selection depth reached
                    break

                if current_node.board.turn:
                    # white to play => maximizer
                    best_ucb = -inf
                else:
                    # black to play => minimizer
                    best_ucb = inf

                best_node = None
                for descendant in current_node.get_descendants():
                    # calculate upper confidence bound of each descendant
                    if descendant.visits > 0:
                        ucb_exploitation = descendant.score / descendant.visits
                        ucb_exploration = self.C * 1.414 * sqrt(log(current_node.visits) / descendant.visits)
                        ucb = ucb_exploitation + ucb_exploration
                        if current_node.board.turn and ucb > best_ucb:
                            best_ucb = ucb
                            best_node = descendant
                            print("  + node", current_node.board.peek(), ", W ucb=", ucb,
                                  ", exploit=", ucb_exploitation, ", explore=", ucb_exploration)
                        elif (not current_node.board.turn) and ucb < best_ucb:
                            best_ucb = ucb
                            best_node = descendant
                            print("  + node", current_node.board.peek(), ", B ucb=", ucb,
                                  ", exploit=", ucb_exploitation, ", explore=", ucb_exploration)
                    else:
                        # node has never been visited before, so we have to pick it
                        best_node = descendant

                # next node to explore
                current_node = best_node

                # 2) Expansion
                # ********************************************************************
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
            score = simulated_node.calculate_score()
            print(">>> simulation:", simulated_branch_depth, "simulated nodes; score=", score)
            for visited_node in self.tree_search_branch:
                visited_node.visits += 1
                visited_node.score += score
            print(">>> backup:", len(self.tree_search_branch), "nodes updated")

            # check if there is time left
            # ********************************************************************
            simulations_count += 1
            if simulations_count % 10 == 0:
                et = datetime.datetime.now()
                elapsed_time = (et - st).total_seconds()
                if elapsed_time > self.max_search_time:
                    print("elapsed_time > max_search_time => stop tree search")
                    break

        # ####################################################################
        # 5) Move selection
        # ####################################################################
        max_visits = 0
        next_node = None
        for descendant in root_node.get_descendants():
            if descendant.visits > max_visits:
                max_visits = descendant.visits
                next_node = descendant

        et = datetime.datetime.now()
        self.stats['search_time'] = (et - st).total_seconds()
        self.stats['simulations_count'] = simulations_count
        self.stats['node_visits'] = next_node.visits
        self.stats['node_avg_score'] = next_node.score / next_node.visits
        next_move = next_node.board.peek()
        print("Next move", next_move)
        return next_move, next_node, self.stats


# run
if __name__ == "__main__":
    import chess
    b = chess.Board()
    b.push_san("e4")
    b.push_san("e5")
    b.push_san("Qh5")
    b.push_san("Nc6")
    # b.push_san("Bc4")

    # create initial node
    initial_node = Node(b)
    mcts = MCTS(max_search_time=3, C=1.0, max_simulation_depth=10, max_selection_depth=10)
    print("*********************** START MCTS ***************************")
    next_move, next_node, stats = mcts.search(initial_node)
    print(stats)
    print(initial_node.board, "\n-----", next_move, '-----\n', next_node.board)
    print("*********************** END MCTS ***************************")


