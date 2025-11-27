import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLiveDealer } from '@/hooks/useLiveDealer';
import { Mic, MicOff, MessageSquare, DollarSign } from 'lucide-react';

export const LiveDealerInterface = () => {
  const {
    status,
    messages,
    dealers,
    selectedDealer,
    currentGame,
    balance,
    currentBet,
    startSession,
    endSession,
    sendMessage,
    placeBet,
    selectDealer,
    selectGame,
  } = useLiveDealer();

  const [textInput, setTextInput] = useState('');
  const [betAmount, setBetAmount] = useState(1000);

  const games = ['Blackjack', 'Roulette', 'Baccarat', 'Poker'];
  const quickBets = [500, 1000, 2000, 5000];

  const handleSendMessage = () => {
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dealer Selection & Game Info */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Live Dealer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dealer Profiles */}
          <div className="space-y-2">
            {dealers.map((dealer) => (
              <div
                key={dealer.name}
                onClick={() => selectDealer(dealer)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDealer.name === dealer.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{dealer.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{dealer.name}</h3>
                    <p className="text-xs text-muted-foreground">{dealer.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1">{dealer.language}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Game Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Game</label>
            <div className="grid grid-cols-2 gap-2">
              {games.map((game) => (
                <Button
                  key={game}
                  variant={currentGame.toLowerCase() === game.toLowerCase() ? 'default' : 'outline'}
                  onClick={() => selectGame(game.toLowerCase())}
                  disabled={status !== 'idle'}
                  size="sm"
                >
                  {game}
                </Button>
              ))}
            </div>
          </div>

          {/* Balance */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
            {currentBet > 0 && (
              <p className="text-sm text-primary mt-1">Current Bet: ₦{currentBet.toLocaleString()}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedDealer.name}'s Table - {currentGame.charAt(0).toUpperCase() + currentGame.slice(1)}
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {status === 'idle' && 'Not Connected'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && 'Live'}
              {status === 'disconnected' && 'Disconnected'}
              {status === 'error' && 'Error'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <ScrollArea className="h-[300px] border rounded-lg p-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Connect to start playing with your live dealer</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {msg.role === 'user' ? '👤' : selectedDealer.avatar}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {msg.role === 'user' ? 'You' : selectedDealer.name}
                    </p>
                    <p className="text-sm mt-1">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>

          {/* Controls */}
          <div className="space-y-3">
            {!isConnected ? (
              <Button
                onClick={startSession}
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                <Mic className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Start Live Session'}
              </Button>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>

                {/* Betting Controls */}
                <div className="border rounded-lg p-4 space-y-3">
                  <label className="text-sm font-medium">Place Your Bet</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      min={100}
                      step={100}
                    />
                    <Button onClick={() => placeBet(betAmount)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Bet
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {quickBets.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => placeBet(amount)}
                        className="flex-1"
                      >
                        ₦{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={endSession}
                  variant="destructive"
                  className="w-full"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
