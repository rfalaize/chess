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
from math import sqrt, log
import random

# ********************************************************************
# Node of the game tree
# ********************************************************************
class Node:
    def __init__(self, game):
        # current board position of the board
        self.game = game
        # statistics to keep for training
        self.visits = 0
        self.score = 0

    def descendants(self):
        # to do: return descendants of that node,
        # i.e positions after each possible legal move
        return


# ********************************************************************
# Monte carlo tree search implementation
# ********************************************************************
class MCTS:

    def __init__(self, max_search_time=10, C=1.0):
        # hyper parameters
        self.max_search_time = max_search_time  # in seconds
        self.C = C
        # statistics kept while traversing the tree
        self.nodes_scores = {}
        self.nodes_visits = {}
        # list of nodes representing the tree path followed
        self.path = []

    def search(self, root_node):
        st = datetime.datetime.now()
        simulations_count = 0
        self.path = []

        while True:
            # 1) Selection
            # ********************************************************************
            current_node = root_node
            while current_node is not None:
                f = sqrt(2 * log(self.nodes_visits[current_node]))
                best_ucb = 0
                best_node = None
                for descendant in current_node.descendants():
                    descendant_visits = self.nodes_visits[descendant]
                    if descendant_visits > 0:
                        ucb = self.nodes_scores[descendant] / descendant_visits \
                            + self.C * f / sqrt(descendant_visits)
                    if ucb > best_ucb:
                        best_ucb = ucb
                        best_node = descendant

                if best_node is None:
                    break

                # append node to the path
                current_node = best_node
                self.path += [current_node]

            # 2) Expansion
            # ********************************************************************
            current_node = Node()
            self.path += [current_node]

            # 3) Simulation
            # ********************************************************************
            while not current_node.is_leaf():
                current_node = random.choice(current_node.descendants())

            # 4) Backup
            # ********************************************************************
            score = current_node.score
            for visited_node in self.path:
                visited_node.visits += 1
                visited_node.score += score

            # check if there is time left
            simulations_count += 1
            if simulations_count % 10 == 0:
                et = datetime.datetime.now()
                if (et - st).total_seconds() > self.max_search_time:
                    break

        # 5) Move selection
        # ********************************************************************
        max_visits = -1
        next_node = None
        for descendant in root_node.descendants():
            if descendant.visits > max_visits:
                max_visits = descendant.visits
                next_node = descendant
        return next_node





