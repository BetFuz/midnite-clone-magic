import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Download,
  Calendar as CalendarIcon,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: Date;
  reference: string;
  method?: string;
}

const AdvancedTransactions = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 10000,
      status: 'completed',
      description: 'Bank Transfer Deposit',
      date: new Date('2025-11-10'),
      reference: 'DEP-2025-001',
      method: 'Bank Transfer',
    },
    {
      id: '2',
      type: 'bet',
      amount: -2000,
      status: 'completed',
      description: '5-Fold Accumulator',
      date: new Date('2025-11-10'),
      reference: 'BET-2025-128',
    },
    {
      id: '3',
      type: 'win',
      amount: 5240,
      status: 'completed',
      description: 'Win: Man City vs Arsenal',
      date: new Date('2025-11-09'),
      reference: 'WIN-2025-045',
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: -5000,
      status: 'pending',
      description: 'Withdrawal to Bank Account',
      date: new Date('2025-11-09'),
      reference: 'WD-2025-012',
      method: 'Bank Transfer',
    },
    {
      id: '5',
      type: 'refund',
      amount: 1000,
      status: 'completed',
      description: 'Acca Insurance Refund',
      date: new Date('2025-11-08'),
      reference: 'REF-2025-003',
    },
  ]);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'refund':
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
      case 'withdrawal':
      case 'bet':
        return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-500/10 text-green-600';
      case 'withdrawal':
        return 'bg-red-500/10 text-red-600';
      case 'bet':
        return 'bg-orange-500/10 text-orange-600';
      case 'win':
        return 'bg-blue-500/10 text-blue-600';
      case 'refund':
        return 'bg-purple-500/10 text-purple-600';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'failed':
        return 'bg-red-500/10 text-red-600';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !tx.reference.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateFrom && tx.date < dateFrom) return false;
    if (dateTo && tx.date > dateTo) return false;
    return true;
  });

  const handleExport = () => {
    toast.success('Export Started', {
      description: 'Your transaction history is being prepared for download',
    });
  };

  const calculateTotals = () => {
    const totalDeposits = filteredTransactions
      .filter(tx => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalWithdrawals = Math.abs(filteredTransactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0));
    
    const totalWins = filteredTransactions
      .filter(tx => tx.type === 'win')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { totalDeposits, totalWithdrawals, totalWins };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalDeposits)}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalWithdrawals)}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Winnings</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.totalWins)}</p>
            </div>
            <Badge variant="secondary" className="text-lg">
              {filteredTransactions.length}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="bet">Bets</SelectItem>
              <SelectItem value="win">Wins</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PP') : 'Date Range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setTypeFilter('all');
            setStatusFilter('all');
            setSearchQuery('');
            setDateFrom(undefined);
            setDateTo(undefined);
          }}>
            Clear Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        
        <div className="space-y-3">
          {filteredTransactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                {getTypeIcon(tx.type)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{tx.description}</h3>
                    <Badge className={getTypeColor(tx.type)} variant="secondary">
                      {tx.type}
                    </Badge>
                    <Badge className={getStatusColor(tx.status)} variant="secondary">
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{format(tx.date, 'PPp')}</span>
                    <span>•</span>
                    <span>{tx.reference}</span>
                    {tx.method && (
                      <>
                        <span>•</span>
                        <span>{tx.method}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions found matching your filters</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdvancedTransactions;
