from engines.arena import Arena, PlayTournament
from engines.rnd.engine import Engine as EngineRandom
from engines.minimax.v2.engine import Engine as EngineMinimaxV2


def test_PlayGame():
    print("********************* PIT *************************")
    player1 = EngineRandom()
    player2 = EngineMinimaxV2()
    arena = Arena(player1, player2)
    arena.playGame(verbose=True)
    print("********************* END *************************")

def test_PlayTournament():
    player1 = EngineRandom()
    player2 = EngineMinimaxV2()
    PlayTournament(player1, player2, num_games=8)

if __name__ == '__main__':
    test_PlayTournament()