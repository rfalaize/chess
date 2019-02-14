# DQN Model

import torch
import torch.nn as nn
import torch.nn.functional as f
import torch.optim as optim
from torch.autograd import Variable

class ChessNet():

    def __init__(self):
        # inputs: 6 pieces * 2 colors * 8*8 binary feature maps + 1 (turn)
        self.input_size = 6 * 2 * 64 + 1
        # outputs: 32 pieces, 64 possible squares
        self.action_size = 32 * 64

        # model
        # *********************************************
        self.fc1 = nn.Linear(self.input_size, 1024)
        # self.fc1_bn = nn.BatchNorm1d(1024)

        self.fc2 = nn.Linear(1024, 1024)
        # self.fc2_bn = nn.BatchNorm1d(1024)

        self.fc3 = nn.Linear(1024, 1024)
        # self.fc3_bn = nn.BatchNorm1d(1024)

        # return move probabilities and estimated score
        self.out1 = nn.Linear(1024, self.action_size)
        self.out2 = nn.Linear(1024, 1)

    def forward(self, s):
        s = f.relu(self.fc1(s))
        s = f.relu(self.fc2(s))
        s = f.relu(self.fc3(s))
        pi = f.relu(self.out1(s))
        v = f.relu(self.out2(s))

        return f.softmax(pi, dim=1), torch.tanh(v)