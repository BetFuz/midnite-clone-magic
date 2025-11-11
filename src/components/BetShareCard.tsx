import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BetShareCardProps {
  totalOdds: number;
  stake: number;
  potentialWin: number;
  selectionCount: number;
}

const BetShareCard = ({ totalOdds, stake, potentialWin, selectionCount }: BetShareCardProps) => {
  const generateShareText = () => {
    return `🎯 My ${selectionCount}-Fold Accumulator\n💰 Stake: ₦${stake}\n📈 Total Odds: @${totalOdds.toFixed(2)}\n🏆 Potential Win: ₦${potentialWin.toFixed(2)}\n\nJoin me on Betfuz! 🚀`;
  };

  const handleCopyBetCode = () => {
    const betCode = `BF${Date.now().toString(36).toUpperCase()}`;
    navigator.clipboard.writeText(betCode);
    toast.success('Bet Code Copied!', {
      description: `Code: ${betCode} - Share with friends to copy your bet`,
    });
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const text = encodeURIComponent(generateShareText());
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://betfuz.com&quote=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    toast.success('Opening share dialog...');
  };

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Share Your Bet</h3>
        <Badge variant="secondary" className="ml-auto">Social</Badge>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleCopyBetCode}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Bet Code
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => handleShare('twitter')}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>
          <Button
            onClick={() => handleShare('facebook')}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Friends can copy your bet using your bet code
      </p>
    </Card>
  );
};

export default BetShareCard;
