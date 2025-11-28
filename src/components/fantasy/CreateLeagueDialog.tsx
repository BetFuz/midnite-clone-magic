import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreateLeagueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeagueCreated?: () => void;
}

export function CreateLeagueDialog({ open, onOpenChange, onLeagueCreated }: CreateLeagueDialogProps) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Football");
  const [season, setSeason] = useState("");
  const [entryFee, setEntryFee] = useState("10000");
  const [prizePool, setPrizePool] = useState("450000");
  const [maxParticipants, setMaxParticipants] = useState("100");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !sport || !season || !entryFee || !prizePool || !deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fantasy_leagues')
        .insert({
          name,
          sport,
          season,
          entry_fee: Number(entryFee),
          prize_pool: Number(prizePool),
          max_participants: Number(maxParticipants) || null,
          deadline: deadline.toISOString(),
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "League Created!",
        description: `${name} has been created successfully`,
      });

      // Reset form
      setName("");
      setSport("Football");
      setSeason("");
      setEntryFee("10000");
      setPrizePool("450000");
      setMaxParticipants("100");
      setDeadline(undefined);
      
      onOpenChange(false);
      onLeagueCreated?.();
    } catch (error) {
      console.error('Error creating league:', error);
      toast({
        title: "Error",
        description: "Failed to create league. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Fantasy League</DialogTitle>
          <DialogDescription>
            Create your own fantasy league for others to join
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">League Name</Label>
            <Input
              id="name"
              placeholder="Premier League Fantasy 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Cricket">Cricket</SelectItem>
                <SelectItem value="Tennis">Tennis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Season/Competition</Label>
            <Input
              id="season"
              placeholder="2024/25 Season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (₦)</Label>
              <Input
                id="entryFee"
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool (₦)</Label>
              <Input
                id="prizePool"
                type="number"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="100"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create League"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
