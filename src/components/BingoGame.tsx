import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBingo, BingoCard as BingoCardType } from '@/hooks/useBingo';
import { Users, Trophy, Clock, Play, ShoppingCart } from 'lucide-react';

const BingoCardComponent = ({ card }: { card: BingoCardType }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-5 gap-1">
          {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => (
            <div key={idx} className="aspect-square flex items-center justify-center font-bold text-primary bg-primary/10 rounded">
              {letter}
            </div>
          ))}
          {card.numbers.map((row, rowIdx) =>
            row.map((num, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`aspect-square flex items-center justify-center rounded font-semibold transition-all ${
                  card.marked[rowIdx][colIdx]
                    ? 'bg-primary text-primary-foreground scale-95'
                    : num === null
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {num === null ? 'FREE' : num}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const BingoGame = () => {
  const {
    balance,
    rooms,
    activeRoom,
    cards,
    drawnNumbers,
    lastDrawn,
    isDrawing,
    gameActive,
    buyCards,
    startGame,
    drawNumber,
    joinRoom
  } = useBingo();

  useEffect(() => {
    if (isDrawing && gameActive) {
      const interval = setInterval(() => {
        drawNumber();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isDrawing, gameActive, drawNumber]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          🎱 AI Bingo
        </h1>
        <p className="text-muted-foreground">Join a room and win big prizes!</p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Balance: ₦{balance.toLocaleString()}
          </Badge>
          {lastDrawn && (
            <Badge className="text-2xl px-6 py-3 animate-bounce-in bg-primary">
              {lastDrawn}
            </Badge>
          )}
        </div>
      </div>

      {/* Bingo Rooms */}
      {!activeRoom && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Rooms</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => joinRoom(room)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{room.name}</span>
                    <Badge>{room.pattern}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Card Price</p>
                      <p className="font-bold">₦{room.cardPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prize Pool</p>
                      <p className="font-bold text-primary">₦{room.prize.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{room.players}/{room.maxPlayers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Next: {room.nextDraw}</span>
                    </div>
                  </div>
                  <Button className="w-full">Join Room</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Game */}
      {activeRoom && (
        <div className="space-y-6">
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{activeRoom.name}</h2>
                  <p className="text-muted-foreground">Prize: ₦{activeRoom.prize.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => buyCards(1)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy 1 Card (₦{activeRoom.cardPrice})
                  </Button>
                  <Button variant="outline" onClick={() => buyCards(3)}>
                    Buy 3 Cards
                  </Button>
                  {!gameActive && cards.length > 0 && (
                    <Button onClick={startGame}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Game
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drawn Numbers */}
          {drawnNumbers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Drawn Numbers ({drawnNumbers.length}/75)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {drawnNumbers.map((num) => (
                    <Badge key={num} variant={num === lastDrawn ? 'default' : 'outline'} className="text-lg px-3 py-1">
                      {num}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bingo Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {cards.map((card) => (
              <BingoCardComponent key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
