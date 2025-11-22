import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { EditDrawer } from "@/components/admin/EditDrawer";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  commenceTime: string;
  status: string;
}

const mockMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    league: "Premier League",
    sport: "Football",
    commenceTime: "2025-01-15T15:00:00Z",
    status: "upcoming",
  },
  // TODO: DEV – fetch from matches table
];

export default function Events() {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
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

  const handleSave = () => {
    // TODO: DEV – validate, upsert to DB, update odds cache
    toast.success(selectedMatch ? "Match updated" : "Match created");
    setEditDrawerOpen(false);
    setSelectedMatch(null);
  };

  const handleDelete = () => {
    // TODO: DEV – soft delete, cascade to bets, notify users
    toast.success("Match deleted");
    setDeleteDialogOpen(false);
    setSelectedMatch(null);
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
              <p className="text-muted-foreground">Manage sports events and fixtures</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Match
            </Button>
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
