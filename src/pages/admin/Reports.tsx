import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGenerateReport = (reportType: string) => {
    // TODO: DEV – query aggregates, generate PDF with charts, email download link
    toast.success(`${reportType} report generated`);
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate platform reports</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Revenue Report</h3>
                    <p className="text-sm text-muted-foreground">GGR, NGR, deposits</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleGenerateReport("Revenue")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">User Activity</h3>
                    <p className="text-sm text-muted-foreground">DAU, MAU, retention</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleGenerateReport("User Activity")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Bet Analysis</h3>
                    <p className="text-sm text-muted-foreground">Win rate, liability</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleGenerateReport("Bet Analysis")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
