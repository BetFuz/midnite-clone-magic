import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Download, Upload, Share2 } from "lucide-react";

interface LineupExportModalProps {
  lineupId: string;
  lineupData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LineupExportModal({ lineupId, lineupData, open, onOpenChange }: LineupExportModalProps) {
  const [exportCode, setExportCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("fantasy_lineup_exports")
        .insert({
          user_id: user.user.id,
          lineup_id: lineupId,
          export_code: code,
          export_data: lineupData,
        });

      if (error) throw error;
      setExportCode(code);
      toast.success("Lineup exported!");
    } catch (error) {
      toast.error("Failed to export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Export/Import Lineup
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="p-4">
            <Button onClick={handleExport} disabled={loading} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Generate Export Code
            </Button>
            {exportCode && (
              <div className="mt-3 p-3 bg-muted rounded text-center">
                <div className="text-2xl font-bold font-mono">{exportCode}</div>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
