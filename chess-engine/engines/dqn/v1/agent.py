'''
Environment infos

Observations
-------------------------------------------
0	Cart Position	[-2.4; 2.4]
1	Cart Velocity	[-Inf;Inf]
2	Pole Angle	    [-41.8°;41.8°]
3	Pole Velocity At Tip [-Inf;Inf]

Actions
-------------------------------------------
0	Push cart to the left
1	Push cart to the right
'''

import random

import numpy as np
import tensorflow as tf
import keras
from keras.models import Sequential
from keras.layers import Dense
from keras.optimizers import Adam
from keras.callbacks import TensorBoard
from collections import deque
from time import time

# Neural network for Deep Q Learning (DQN)
# -------------------------------------------
# We create a neural network policy that will predict rewards for each state.
# It will receive a state 's' as input, and compute the state-action value Q(s,a) 
# of each action 'a' in state 's'

# The loss function which we want to minimize is defined as follow:
# loss  = (r + gamma*[max Q(s',a')] - Q(s,a))^2
#       = (Y - Q(s,a))^2
# with 
# Y = r + gamma*[max Q(s',a')] >> Y is the target that the model will try to predict
#   >> r = immediate reward after taking action 'a' in state 's'
#   >> gamma = discount factor, to take into account the time value of reward (immediate rewards are worth more than future rewards)
#   >> max Q(s',a') is the expected future reward once reaching state s' (supposing the agent will act optimally)
# and 
# Q(s,a) is the model's prediction for the action value function

# Deep Q-Learning agent
class DQNAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=10000)
        self.gamma = 0.99 # discount rate
        self.epsilon = 1.0 # exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = 0.001
        self.model = self.CreateModel()
        self.tensorboard = None        
        
    def CreateModel(self):
        # Neural network for deep Q learning model
        # input layer of state size (4); output layer of action size (2)
        model = Sequential()
        model.add(Dense(1024, input_dim=self.state_size, activation='relu'))
        model.add(Dense(1024, activation='relu'))
        model.add(Dense(self.action_size, activation='linear'))
        optimizer = Adam(lr=self.learning_rate)
        model.compile(optimizer, loss='mse')
        return model
    
    def Remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))
    
    def Act(self, state, epsilon_random=True):
        if (epsilon_random and np.random.rand() <= self.epsilon):
            return random.randrange(self.action_size)
        action_values = self.model.predict(state)
        action = np.argmax(action_values)
        return action

    def Replay(self, batch_size):
        # sample a mini batch of memories
        batch_sample_size = min(len(self.memory), batch_size) # in case there is not enough memories
        minibatch = random.sample(self.memory, batch_sample_size)
        
        for state, action, reward, next_state, done in minibatch:
            if done:
                target = reward
            else:            
                target = reward + self.gamma * np.amax(self.model.predict(next_state)[0])
            target_f = self.model.predict(state)
            target_f[0][action] = target
            
            if not self.tensorboard is None:
                self.model.fit(state, target_f, epochs=1, verbose=0, callbacks=[self.tensorboard])
            else:                
                self.model.fit(state, target_f, epochs=1, verbose=0)
            
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

if __name__ == "__main__":
    
    # initialize the environment
    env = gym.make('CartPole-v0')
    #env = gym.wrappers.Monitor(env, './videos/', force=True) # record using monitor

    config = tf.ConfigProto( device_count = {'GPU': 1 , 'CPU': 4} ) 
    sess = tf.Session(config=config) 
    keras.backend.set_session(sess)
    
    agent = DQNAgent(env.observation_space.shape[0], env.action_space.n)
    
    # add tensorboard logs
    # tensorboard = TensorBoard(log_dir="./logs/{}".format(time()))
    # agent.tensorboard = tensorboard
    
    # Play the game N times
    N = 5000
    for e in range(N):
        
        # reset the environment
        state = env.reset()
        state = np.reshape(state, [1, 4])
        
        # our goal is to keep the pole upright during 
        # as many frames as possible until a max of 500
        for frame in range(500):
            # turn on/off rendering
            #env.render()
            
            # decide action
            action = agent.Act(state)
            
            # advance the game to the next frame based on the action
            # reward is 1 for every frame the pole survived
            next_state, reward, done, _  = env.step(action)
            next_state = np.reshape(next_state, [1, 4])
            
            # remember
            agent.Remember(state, action, reward, next_state, done)
            
            state = next_state
            
            # done becomes true when the game ends (ex: pole drops)
            if done:
                if (e % 10) == 0:
                    print('Episode {}/{}; score={}; epsilon={}'.format(e, N, frame, agent.epsilon))
                break
                
        # train the agent with the experience of the episode
        agent.Replay(32)
    
    
    # play the game once training
    print('End training. Start playing...')
    state = env.reset()
    # record using monitor
    env = gym.wrappers.Monitor(env, './videos/', force=True) 
    state = env.reset()
    state = np.reshape(state, [1, 4])
    for i in range(500):
        env.render()
        action = agent.Act(state, epsilon_random=False)
        state, reward, done, _ = env.step(action)
        state = np.reshape(state, [1, 4])
        print('Frame ', i, ':', state, '; reward:', reward)
        if done:
            break
    print('Game finished.')