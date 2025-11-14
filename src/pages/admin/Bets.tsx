import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle } from "lucide-react";

const Bets = () => {
  // Mock data
  const recentBets = [
    {
      id: "1",
      user: "user@example.com",
      type: "Single",
      stake: 1000,
      odds: 2.5,
      potentialWin: 2500,
      status: "Pending",
      time: "2 mins ago",
    },
    {
      id: "2",
      user: "vip@example.com",
      type: "Accumulator",
      stake: 5000,
      odds: 12.8,
      potentialWin: 64000,
      status: "Won",
      time: "15 mins ago",
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Bets & Tickets</h1>
            <p className="text-muted-foreground">Monitor and manage all betting activity</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">₦2.4M total stake</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Won Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">128</div>
                <p className="text-xs text-muted-foreground">₦1.8M paid out</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Lost Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">89</div>
                <p className="text-xs text-muted-foreground">₦890K lost</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  House Edge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">+₦920K</div>
                <p className="text-xs text-muted-foreground">Today's profit</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bets</CardTitle>
              <CardDescription>Live betting activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="won">Won</TabsTrigger>
                  <TabsTrigger value="lost">Lost</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Odds</TableHead>
                        <TableHead>Potential Win</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBets.map((bet) => (
                        <TableRow key={bet.id}>
                          <TableCell className="font-medium">{bet.user}</TableCell>
                          <TableCell>{bet.type}</TableCell>
                          <TableCell>₦{bet.stake.toLocaleString()}</TableCell>
                          <TableCell>{bet.odds.toFixed(2)}</TableCell>
                          <TableCell>₦{bet.potentialWin.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                bet.status === "Won"
                                  ? "default"
                                  : bet.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {bet.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{bet.time}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Bets;
