import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { EditDrawer } from "@/components/admin/EditDrawer";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  commenceTime: string;
  status: string;
}

export default function Events() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    league: "",
    sport: "Football",
    commenceTime: "",
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('commence_time', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMatches: Match[] = data.map(match => ({
        id: match.id,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        league: match.league_name,
        sport: match.sport_title,
        commenceTime: match.commence_time,
        status: match.status || 'upcoming',
      }));

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Match>[] = [
    {
      accessorKey: "homeTeam",
      header: "Home Team",
    },
    {
      accessorKey: "awayTeam",
      header: "Away Team",
    },
    {
      accessorKey: "league",
      header: "League",
    },
    {
      accessorKey: "sport",
      header: "Sport",
    },
    {
      accessorKey: "commenceTime",
      header: "Kick-off",
      cell: ({ row }) => new Date(row.original.commenceTime).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      sport: match.sport,
      commenceTime: match.commenceTime,
    });
    setEditDrawerOpen(true);
  };

  const handleDeleteClick = (match: Match) => {
    setSelectedMatch(match);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.homeTeam || !formData.awayTeam || !formData.league || !formData.commenceTime) {
        toast.error('Please fill in all required fields');
        return;
      }

      toast.loading('Saving match...');

      // Note: In production, this would use an admin edge function
      // For now, direct database access (requires proper RLS policies)
      const matchData = {
        home_team: formData.homeTeam,
        away_team: formData.awayTeam,
        league_name: formData.league,
        sport_title: formData.sport,
        sport_key: formData.sport.toLowerCase(),
        commence_time: new Date(formData.commenceTime).toISOString(),
        match_id: `${formData.homeTeam}-${formData.awayTeam}-${Date.now()}`,
        status: 'upcoming',
      };

      if (selectedMatch) {
        // Update existing match
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', selectedMatch.id);

        if (error) throw error;
        toast.success('Match updated successfully');
      } else {
        // Create new match
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);

        if (error) throw error;
        toast.success('Match created successfully');
      }

      setEditDrawerOpen(false);
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Error saving match:', error);
      toast.error('Failed to save match. Check admin permissions.');
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedMatch) return;

      toast.loading('Deleting match...');

      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', selectedMatch.id);

      if (error) throw error;

      toast.success('Match deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('Failed to delete match. Check admin permissions.');
    }
  };

  const handleCreate = () => {
    setSelectedMatch(null);
    setFormData({
      homeTeam: "",
      awayTeam: "",
      league: "",
      sport: "Football",
      commenceTime: "",
    });
    setEditDrawerOpen(true);
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Match Events</h1>
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `${matches.length} matches in database`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchMatches} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={matches}
            searchKey="homeTeam"
            searchPlaceholder="Search by team name..."
          />

          <EditDrawer
            open={editDrawerOpen}
            onOpenChange={setEditDrawerOpen}
            title={selectedMatch ? "Edit Match" : "Create Match"}
            description="Update match details and schedule"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Home Team</Label>
                <Input
                  value={formData.homeTeam}
                  onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  placeholder="e.g., Arsenal"
                />
              </div>
              <div className="space-y-2">
                <Label>Away Team</Label>
                <Input
                  value={formData.awayTeam}
                  onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  placeholder="e.g., Chelsea"
                />
              </div>
              <div className="space-y-2">
                <Label>League</Label>
                <Input
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  placeholder="e.g., Premier League"
                />
              </div>
              <div className="space-y-2">
                <Label>Kick-off Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.commenceTime}
                  onChange={(e) => setFormData({ ...formData, commenceTime: e.target.value })}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </EditDrawer>

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            title="Delete Match"
            description="Are you sure you want to delete this match? This action cannot be undone."
            variant="destructive"
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
