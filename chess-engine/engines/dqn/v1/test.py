import chess

b = chess.Board()

b.legal_moves
# chess.Move.from_uci("a8a1") in b.legal_moves

b.push_san("e4")
b.push_san("e5")
b.push_san("Qh5")
b.push_san("Nc6")

b.is_checkmate()

#%% encode the state in numeric inputs to be passed to a neural network
import numpy as np
layers = {}

colors = [0, 1]                     # 0=black, 1=white
pieces = [1, 2, 3, 4, 5, 6]         # 1=pawn, 2=knight, 3=bishop, 4=rook, 5=queen, 6=king
mask_types = [0, 1]                 # 0=moves, 1=squares

for color in colors:
    for piece in pieces:
        for mask_type in mask_types:
            # each layer is a matrix of 8*8 boolean values,
            # flattened into a 1D array
            layers[(color, piece, mask_type)] = np.zeros(64)

# fill current position
for i in range(64):
    piece = b.piece_at(i)
    if piece == None:
        continue
    layers[(int(piece.color), piece.piece_type, 0)][i] = 1.0

# fill legal moves
for move in b.legal_moves:
    from_square = move.from_square
    piece = b.piece_at(from_square)
    layers[(int(piece.color), piece.piece_type, 1)][move.to_square] += 1.0

# flatten layers
inputs = np.array(list(layers.values())).ravel()

# additional features
inputs = np.append(inputs, float(b.turn))
inputs = np.append(inputs, float(b.is_check()))
inputs = np.append(inputs, float(b.is_checkmate()))
inputs = np.append(inputs, float(b.is_stalemate()))
inputs = np.append(inputs, float(b.is_insufficient_material()))
inputs = np.append(inputs, float(b.has_kingside_castling_rights(b.turn)))
inputs = np.append(inputs, float(b.has_queenside_castling_rights(b.turn)))
inputs = np.append(inputs, float(b.is_game_over()))


#%% create neural network

import keras
