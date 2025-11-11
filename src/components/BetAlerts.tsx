import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BetAlert {
  id: string;
  match: string;
  selection: string;
  targetOdds: number;
  currentOdds: number;
  active: boolean;
}

const BetAlerts = () => {
  const [alerts, setAlerts] = useState<BetAlert[]>([
    {
      id: '1',
      match: 'Man City vs Arsenal',
      selection: 'Home Win',
      targetOdds: 2.50,
      currentOdds: 2.10,
      active: true,
    },
    {
      id: '2',
      match: 'Barcelona vs Real Madrid',
      selection: 'Over 2.5',
      targetOdds: 2.00,
      currentOdds: 1.75,
      active: true,
    },
  ]);

  const [newAlert, setNewAlert] = useState({
    match: '',
    selection: '',
    targetOdds: '',
  });

  const handleAddAlert = () => {
    if (!newAlert.match || !newAlert.selection || !newAlert.targetOdds) {
      toast.error('Fill all fields', {
        description: 'Please complete all fields to create an alert',
      });
      return;
    }

    const alert: BetAlert = {
      id: Date.now().toString(),
      match: newAlert.match,
      selection: newAlert.selection,
      targetOdds: parseFloat(newAlert.targetOdds),
      currentOdds: 1.50, // Mock current odds
      active: true,
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ match: '', selection: '', targetOdds: '' });

    toast.success('Alert Created!', {
      description: `We'll notify you when ${newAlert.selection} reaches ${newAlert.targetOdds}`,
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alert Deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Bet Alerts</h2>
        <Badge variant="secondary" className="ml-auto">{alerts.length} Active</Badge>
      </div>

      {/* Create New Alert */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Create New Alert</h3>
        
        <div className="space-y-2">
          <Input
            placeholder="Match (e.g., Man City vs Arsenal)"
            value={newAlert.match}
            onChange={(e) => setNewAlert(prev => ({ ...prev, match: e.target.value }))}
          />
          
          <Input
            placeholder="Selection (e.g., Home Win)"
            value={newAlert.selection}
            onChange={(e) => setNewAlert(prev => ({ ...prev, selection: e.target.value }))}
          />
          
          <Input
            type="number"
            step="0.01"
            placeholder="Target Odds (e.g., 2.50)"
            value={newAlert.targetOdds}
            onChange={(e) => setNewAlert(prev => ({ ...prev, targetOdds: e.target.value }))}
          />
        </div>

        <Button className="w-full" onClick={handleAddAlert}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </Card>

      {/* Active Alerts */}
      <div className="space-y-3">
        {alerts.map(alert => {
          const isAboveTarget = alert.currentOdds >= alert.targetOdds;
          
          return (
            <Card key={alert.id} className={`p-4 ${isAboveTarget ? 'border-green-500 bg-green-500/5' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-sm">{alert.match}</h3>
                  <p className="text-xs text-muted-foreground">{alert.selection}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Target</div>
                      <div className="font-bold">{alert.targetOdds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Current</div>
                      <div className={`font-bold ${isAboveTarget ? 'text-green-600' : ''}`}>
                        {alert.currentOdds}
                      </div>
                    </div>
                  </div>

                  {isAboveTarget && (
                    <Badge className="bg-green-500 mt-2">
                      Target Reached! 🎯
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No active alerts</p>
          <p className="text-xs mt-1">Create an alert to get notified when odds reach your target</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Get instant notifications when odds reach your desired value
      </p>
    </div>
  );
};

export default BetAlerts;
