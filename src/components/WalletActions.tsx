import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const WalletActions = () => {
  const { deposit, withdraw, isDepositing, isWithdrawing } = useWallet();
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);

  const handleDeposit = async () => {
    const { data } = await deposit(depositAmount);
    if (data?.clientSecret) {
      console.log('Redirect to Stripe checkout:', data.clientSecret);
      // TODO: Integrate Stripe Elements here
    }
  };

  const handleWithdraw = async () => {
    await withdraw(withdrawAmount, 'bank_transfer');
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="deposit">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Deposit Amount</label>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              min={1000}
              step={1000}
            />
          </div>

          <Button 
            onClick={handleDeposit} 
            disabled={isDepositing}
            className="w-full"
          >
            {isDepositing ? 'Processing...' : `Deposit ₦${depositAmount.toLocaleString()}`}
          </Button>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Withdrawal Amount</label>
            <Input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              min={1000}
              step={1000}
            />
          </div>

          <Button 
            onClick={handleWithdraw} 
            disabled={isWithdrawing}
            className="w-full"
          >
            {isWithdrawing ? 'Processing...' : `Withdraw ₦${withdrawAmount.toLocaleString()}`}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
