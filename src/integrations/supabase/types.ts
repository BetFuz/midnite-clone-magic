export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          mfa_verified: boolean | null
          payload_hash: string | null
          resource_id: string | null
          resource_type: string
          status: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          mfa_verified?: boolean | null
          payload_hash?: string | null
          resource_id?: string | null
          resource_type: string
          status: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          mfa_verified?: boolean | null
          payload_hash?: string | null
          resource_id?: string | null
          resource_type?: string
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_webhook_settings: {
        Row: {
          bet_lost: string | null
          bet_placed: string | null
          bet_won: string | null
          created_at: string | null
          deposit: string | null
          id: number
          updated_at: string | null
          updated_by: string | null
          user_registered: string | null
          withdrawal: string | null
        }
        Insert: {
          bet_lost?: string | null
          bet_placed?: string | null
          bet_won?: string | null
          created_at?: string | null
          deposit?: string | null
          id?: number
          updated_at?: string | null
          updated_by?: string | null
          user_registered?: string | null
          withdrawal?: string | null
        }
        Update: {
          bet_lost?: string | null
          bet_placed?: string | null
          bet_won?: string | null
          created_at?: string | null
          deposit?: string | null
          id?: number
          updated_at?: string | null
          updated_by?: string | null
          user_registered?: string | null
          withdrawal?: string | null
        }
        Relationships: []
      }
      affiliate_boost_periods: {
        Row: {
          commission_multiplier: number
          created_at: string | null
          created_by: string | null
          end_time: string
          event_name: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          commission_multiplier?: number
          created_at?: string | null
          created_by?: string | null
          end_time: string
          event_name: string
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          commission_multiplier?: number
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          event_name?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: []
      }
      affiliate_links: {
        Row: {
          active_referrals: number
          clicks: number
          code: string
          commission: number
          commission_rate: number
          conversions: number
          created_at: string
          daily_salary: number
          id: string
          is_active: boolean
          last_salary_paid_at: string | null
          override_rate: number
          parent_id: string | null
          tier: Database["public"]["Enums"]["affiliate_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active_referrals?: number
          clicks?: number
          code: string
          commission?: number
          commission_rate?: number
          conversions?: number
          created_at?: string
          daily_salary?: number
          id?: string
          is_active?: boolean
          last_salary_paid_at?: string | null
          override_rate?: number
          parent_id?: string | null
          tier?: Database["public"]["Enums"]["affiliate_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active_referrals?: number
          clicks?: number
          code?: string
          commission?: number
          commission_rate?: number
          conversions?: number
          created_at?: string
          daily_salary?: number
          id?: string
          is_active?: boolean
          last_salary_paid_at?: string | null
          override_rate?: number
          parent_id?: string | null
          tier?: Database["public"]["Enums"]["affiliate_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_opponents: {
        Row: {
          created_at: string | null
          difficulty: string
          game_type: string
          id: string
          name: string
          strategy_profile: Json
          total_games: number | null
          win_rate: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          game_type: string
          id?: string
          name: string
          strategy_profile?: Json
          total_games?: number | null
          win_rate?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          game_type?: string
          id?: string
          name?: string
          strategy_profile?: Json
          total_games?: number | null
          win_rate?: number | null
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          away_team: string
          confidence_score: number | null
          created_at: string | null
          home_team: string
          id: string
          match_id: string
          predicted_outcome: string
          prediction_type: string
          reasoning: string | null
          sport: string
        }
        Insert: {
          away_team: string
          confidence_score?: number | null
          created_at?: string | null
          home_team: string
          id?: string
          match_id: string
          predicted_outcome: string
          prediction_type: string
          reasoning?: string | null
          sport: string
        }
        Update: {
          away_team?: string
          confidence_score?: number | null
          created_at?: string | null
          home_team?: string
          id?: string
          match_id?: string
          predicted_outcome?: string
          prediction_type?: string
          reasoning?: string | null
          sport?: string
        }
        Relationships: []
      }
      aml_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bet_copies: {
        Row: {
          bet_slip_id: string
          created_at: string | null
          id: string
          original_bet_id: string
          user_id: string
        }
        Insert: {
          bet_slip_id: string
          created_at?: string | null
          id?: string
          original_bet_id: string
          user_id: string
        }
        Update: {
          bet_slip_id?: string
          created_at?: string | null
          id?: string
          original_bet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_copies_original_bet_id_fkey"
            columns: ["original_bet_id"]
            isOneToOne: false
            referencedRelation: "social_bets"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_listings: {
        Row: {
          asking_price: number
          bet_slip_id: string
          buyer_id: string | null
          created_at: string | null
          id: string
          original_stake: number
          potential_win: number
          seller_id: string
          sold_at: string | null
          status: string | null
        }
        Insert: {
          asking_price: number
          bet_slip_id: string
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          original_stake: number
          potential_win: number
          seller_id: string
          sold_at?: string | null
          status?: string | null
        }
        Update: {
          asking_price?: number
          bet_slip_id?: string
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          original_stake?: number
          potential_win?: number
          seller_id?: string
          sold_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      bet_selections: {
        Row: {
          away_team: string
          bet_slip_id: string | null
          created_at: string | null
          home_team: string
          id: string
          league: string | null
          match_id: string
          match_time: string | null
          odds: number
          selection_type: string
          selection_value: string
          sport: string
          status: string | null
        }
        Insert: {
          away_team: string
          bet_slip_id?: string | null
          created_at?: string | null
          home_team: string
          id?: string
          league?: string | null
          match_id: string
          match_time?: string | null
          odds: number
          selection_type: string
          selection_value: string
          sport: string
          status?: string | null
        }
        Update: {
          away_team?: string
          bet_slip_id?: string | null
          created_at?: string | null
          home_team?: string
          id?: string
          league?: string | null
          match_id?: string
          match_time?: string | null
          odds?: number
          selection_type?: string
          selection_value?: string
          sport?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bet_selections_bet_slip_id_fkey"
            columns: ["bet_slip_id"]
            isOneToOne: false
            referencedRelation: "bet_slips"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_slips: {
        Row: {
          affiliate_code: string | null
          bet_type: string
          created_at: string | null
          id: string
          potential_win: number
          settled_at: string | null
          status: string
          total_odds: number
          total_stake: number
          user_id: string
        }
        Insert: {
          affiliate_code?: string | null
          bet_type?: string
          created_at?: string | null
          id?: string
          potential_win?: number
          settled_at?: string | null
          status?: string
          total_odds?: number
          total_stake?: number
          user_id: string
        }
        Update: {
          affiliate_code?: string | null
          bet_type?: string
          created_at?: string | null
          id?: string
          potential_win?: number
          settled_at?: string | null
          status?: string
          total_odds?: number
          total_stake?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_slips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      betting_trends: {
        Row: {
          bet_count: number | null
          created_at: string | null
          id: string
          match_id: string
          percentage: number | null
          selection_type: string
          selection_value: string
          updated_at: string | null
        }
        Insert: {
          bet_count?: number | null
          created_at?: string | null
          id?: string
          match_id: string
          percentage?: number | null
          selection_type: string
          selection_value: string
          updated_at?: string | null
        }
        Update: {
          bet_count?: number | null
          created_at?: string | null
          id?: string
          match_id?: string
          percentage?: number | null
          selection_type?: string
          selection_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cashout_rules: {
        Row: {
          cool_down_seconds: number
          created_at: string | null
          id: number
          max_cashout_pct: number
          min_pct: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cool_down_seconds?: number
          created_at?: string | null
          id?: number
          max_cashout_pct?: number
          min_pct?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cool_down_seconds?: number
          created_at?: string | null
          id?: number
          max_cashout_pct?: number
          min_pct?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cashout_transactions: {
        Row: {
          bet_slip_id: string
          cashout_amount: number
          cashout_pct: number
          completed_at: string | null
          created_at: string | null
          id: string
          last_cashout_at: string | null
          original_stake: number
          potential_win: number
          rejection_reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          bet_slip_id: string
          cashout_amount: number
          cashout_pct: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_cashout_at?: string | null
          original_stake: number
          potential_win: number
          rejection_reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          bet_slip_id?: string
          cashout_amount?: number
          cashout_pct?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_cashout_at?: string | null
          original_stake?: number
          potential_win?: number
          rejection_reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashout_transactions_bet_slip_id_fkey"
            columns: ["bet_slip_id"]
            isOneToOne: false
            referencedRelation: "bet_slips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashout_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_retention_caps: {
        Row: {
          cap_date: string
          cap_limit: number
          created_at: string | null
          id: string
          total_spent: number
          updated_at: string | null
        }
        Insert: {
          cap_date?: string
          cap_limit?: number
          created_at?: string | null
          id?: string
          total_spent?: number
          updated_at?: string | null
        }
        Update: {
          cap_date?: string
          cap_limit?: number
          created_at?: string | null
          id?: string
          total_spent?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      document_archives: {
        Row: {
          archived_at: string | null
          created_at: string | null
          document_id: string
          document_type: string
          id: string
          is_immutable: boolean | null
          metadata: Json | null
          retention_until: string
          storage_path: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          document_id: string
          document_type: string
          id?: string
          is_immutable?: boolean | null
          metadata?: Json | null
          retention_until: string
          storage_path: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          document_id?: string
          document_type?: string
          id?: string
          is_immutable?: boolean | null
          metadata?: Json | null
          retention_until?: string
          storage_path?: string
          user_id?: string | null
        }
        Relationships: []
      }
      escrow_transfers: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          destination_wallet: string
          id: string
          initiated_by: string | null
          reason: string
          regulatory_flag_id: string | null
          source_wallet: string
          status: string
          tx_hash: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          destination_wallet?: string
          id?: string
          initiated_by?: string | null
          reason: string
          regulatory_flag_id?: string | null
          source_wallet?: string
          status?: string
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          destination_wallet?: string
          id?: string
          initiated_by?: string | null
          reason?: string
          regulatory_flag_id?: string | null
          source_wallet?: string
          status?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transfers_regulatory_flag_id_fkey"
            columns: ["regulatory_flag_id"]
            isOneToOne: false
            referencedRelation: "regulatory_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_contest_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          entry_multiplier: number | null
          id: string
          max_entries: number | null
          min_entries: number | null
          name: string
          payout_structure: Json
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          entry_multiplier?: number | null
          id?: string
          max_entries?: number | null
          min_entries?: number | null
          name: string
          payout_structure: Json
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          entry_multiplier?: number | null
          id?: string
          max_entries?: number | null
          min_entries?: number | null
          name?: string
          payout_structure?: Json
        }
        Relationships: []
      }
      fantasy_leagues: {
        Row: {
          created_at: string | null
          deadline: string
          entry_fee: number
          id: string
          max_participants: number | null
          name: string
          prize_pool: number
          season: string
          sport: string
          status: string
        }
        Insert: {
          created_at?: string | null
          deadline: string
          entry_fee?: number
          id?: string
          max_participants?: number | null
          name: string
          prize_pool?: number
          season: string
          sport: string
          status?: string
        }
        Update: {
          created_at?: string | null
          deadline?: string
          entry_fee?: number
          id?: string
          max_participants?: number | null
          name?: string
          prize_pool?: number
          season?: string
          sport?: string
          status?: string
        }
        Relationships: []
      }
      fantasy_lineups: {
        Row: {
          created_at: string | null
          current_points: number | null
          id: string
          is_locked: boolean | null
          league_id: string
          lineup_name: string
          projected_points: number | null
          roster: Json
          salary_cap: number
          team_id: string
          total_salary: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_points?: number | null
          id?: string
          is_locked?: boolean | null
          league_id: string
          lineup_name: string
          projected_points?: number | null
          roster?: Json
          salary_cap?: number
          team_id: string
          total_salary?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_points?: number | null
          id?: string
          is_locked?: boolean | null
          league_id?: string
          lineup_name?: string
          projected_points?: number | null
          roster?: Json
          salary_cap?: number
          team_id?: string
          total_salary?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_lineups_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "fantasy_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_live_scores: {
        Row: {
          id: string
          last_updated: string | null
          lineup_id: string
          live_points: number | null
          player_id: string
          stats: Json | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          lineup_id: string
          live_points?: number | null
          player_id: string
          stats?: Json | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          lineup_id?: string
          live_points?: number | null
          player_id?: string
          stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_live_scores_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_live_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_player_ownership: {
        Row: {
          id: string
          league_id: string
          ownership_percentage: number | null
          player_id: string
          total_lineups: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          league_id: string
          ownership_percentage?: number | null
          player_id: string
          total_lineups?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          league_id?: string
          ownership_percentage?: number | null
          player_id?: string
          total_lineups?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_player_ownership_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_player_ownership_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_players: {
        Row: {
          average_points: number | null
          created_at: string | null
          external_player_id: string
          full_name: string
          id: string
          injury_status: string | null
          metadata: Json | null
          position: string
          projected_points: number | null
          salary: number
          sport: string
          team: string
          updated_at: string | null
        }
        Insert: {
          average_points?: number | null
          created_at?: string | null
          external_player_id: string
          full_name: string
          id?: string
          injury_status?: string | null
          metadata?: Json | null
          position: string
          projected_points?: number | null
          salary?: number
          sport: string
          team: string
          updated_at?: string | null
        }
        Update: {
          average_points?: number | null
          created_at?: string | null
          external_player_id?: string
          full_name?: string
          id?: string
          injury_status?: string | null
          metadata?: Json | null
          position?: string
          projected_points?: number | null
          salary?: number
          sport?: string
          team?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fantasy_scoring_rules: {
        Row: {
          created_at: string | null
          id: string
          points_per: number
          position: string
          sport: string
          stat_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_per: number
          position: string
          sport: string
          stat_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_per?: number
          position?: string
          sport?: string
          stat_type?: string
        }
        Relationships: []
      }
      fantasy_teams: {
        Row: {
          created_at: string | null
          id: string
          league_id: string
          rank: number | null
          team_name: string
          total_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          league_id: string
          rank?: number | null
          team_name: string
          total_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          league_id?: string
          rank?: number | null
          team_name?: string
          total_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      game_bets: {
        Row: {
          bet_type: string
          bet_value: string
          created_at: string | null
          id: string
          odds: number
          potential_win: number
          session_id: string
          settled_at: string | null
          stake_amount: number
          status: string | null
          user_id: string
        }
        Insert: {
          bet_type: string
          bet_value: string
          created_at?: string | null
          id?: string
          odds: number
          potential_win: number
          session_id: string
          settled_at?: string | null
          stake_amount: number
          status?: string | null
          user_id: string
        }
        Update: {
          bet_type?: string
          bet_value?: string
          created_at?: string | null
          id?: string
          odds?: number
          potential_win?: number
          session_id?: string
          settled_at?: string | null
          stake_amount?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_bets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_moves: {
        Row: {
          id: string
          move_data: Json
          move_number: number
          player: string
          session_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          move_data: Json
          move_number: number
          player: string
          session_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          move_data?: Json
          move_number?: number
          player?: string
          session_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_moves_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_player: string | null
          game_state: Json
          game_type: string
          id: string
          mode: string
          player1_id: string | null
          player2_id: string | null
          stake_amount: number | null
          started_at: string | null
          status: string | null
          winner: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_player?: string | null
          game_state?: Json
          game_type: string
          id?: string
          mode: string
          player1_id?: string | null
          player2_id?: string | null
          stake_amount?: number | null
          started_at?: string | null
          status?: string | null
          winner?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_player?: string | null
          game_state?: Json
          game_type?: string
          id?: string
          mode?: string
          player1_id?: string | null
          player2_id?: string | null
          stake_amount?: number | null
          started_at?: string | null
          status?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          nin: string
          provider: string
          provider_response: Json | null
          selfie_url: string
          updated_at: string | null
          user_id: string
          verification_score: number | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          nin: string
          provider: string
          provider_response?: Json | null
          selfie_url: string
          updated_at?: string | null
          user_id: string
          verification_score?: number | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          nin?: string
          provider?: string
          provider_response?: Json | null
          selfie_url?: string
          updated_at?: string | null
          user_id?: string
          verification_score?: number | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          bonus_points: number | null
          created_at: string | null
          id: string
          rank: number | null
          reward_tier: string | null
          total_bets: number | null
          total_points: number | null
          total_wins: number | null
          updated_at: string | null
          user_id: string
          week_start: string
          win_streak: number | null
        }
        Insert: {
          bonus_points?: number | null
          created_at?: string | null
          id?: string
          rank?: number | null
          reward_tier?: string | null
          total_bets?: number | null
          total_points?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id: string
          week_start: string
          win_streak?: number | null
        }
        Update: {
          bonus_points?: number | null
          created_at?: string | null
          id?: string
          rank?: number | null
          reward_tier?: string | null
          total_bets?: number | null
          total_points?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
          win_streak?: number | null
        }
        Relationships: []
      }
      leagues: {
        Row: {
          created_at: string | null
          id: number
          name: string
          provider_meta: Json | null
          sport_key: string | null
          sport_title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          provider_meta?: Json | null
          sport_key?: string | null
          sport_title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          provider_meta?: Json | null
          sport_key?: string | null
          sport_title?: string | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          currency: string
          description: string
          entry_hash: string | null
          entry_number: number
          id: string
          ip_address: unknown
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          currency?: string
          description: string
          entry_hash?: string | null
          entry_number?: number
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          currency?: string
          description?: string
          entry_hash?: string | null
          entry_number?: number
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          active_bets_count: number
          away_team: string
          created_at: string | null
          home_team: string
          id: string
          league: string
          match_id: string
          quality: string
          scheduled_start: string
          sport: string
          status: string
          stream_url: string | null
          updated_at: string | null
          viewer_count: number
        }
        Insert: {
          active_bets_count?: number
          away_team: string
          created_at?: string | null
          home_team: string
          id?: string
          league: string
          match_id: string
          quality?: string
          scheduled_start: string
          sport: string
          status?: string
          stream_url?: string | null
          updated_at?: string | null
          viewer_count?: number
        }
        Update: {
          active_bets_count?: number
          away_team?: string
          created_at?: string | null
          home_team?: string
          id?: string
          league?: string
          match_id?: string
          quality?: string
          scheduled_start?: string
          sport?: string
          status?: string
          stream_url?: string | null
          updated_at?: string | null
          viewer_count?: number
        }
        Relationships: []
      }
      marketing_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          posted_at: string | null
          status: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          posted_at?: string | null
          status?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          posted_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      match_statistics: {
        Row: {
          away_form: string | null
          away_goals_conceded: number | null
          away_goals_scored: number | null
          away_position: number | null
          away_team: string
          created_at: string | null
          h2h_away_wins: number | null
          h2h_draws: number | null
          h2h_home_wins: number | null
          home_form: string | null
          home_goals_conceded: number | null
          home_goals_scored: number | null
          home_position: number | null
          home_team: string
          id: string
          last_meeting_date: string | null
          last_meeting_result: string | null
          league: string | null
          match_id: string
          sport: string
          updated_at: string | null
        }
        Insert: {
          away_form?: string | null
          away_goals_conceded?: number | null
          away_goals_scored?: number | null
          away_position?: number | null
          away_team: string
          created_at?: string | null
          h2h_away_wins?: number | null
          h2h_draws?: number | null
          h2h_home_wins?: number | null
          home_form?: string | null
          home_goals_conceded?: number | null
          home_goals_scored?: number | null
          home_position?: number | null
          home_team: string
          id?: string
          last_meeting_date?: string | null
          last_meeting_result?: string | null
          league?: string | null
          match_id: string
          sport: string
          updated_at?: string | null
        }
        Update: {
          away_form?: string | null
          away_goals_conceded?: number | null
          away_goals_scored?: number | null
          away_position?: number | null
          away_team?: string
          created_at?: string | null
          h2h_away_wins?: number | null
          h2h_draws?: number | null
          h2h_home_wins?: number | null
          home_form?: string | null
          home_goals_conceded?: number | null
          home_goals_scored?: number | null
          home_position?: number | null
          home_team?: string
          id?: string
          last_meeting_date?: string | null
          last_meeting_result?: string | null
          league?: string | null
          match_id?: string
          sport?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_odds: number | null
          away_team: string
          commence_time: string
          created_at: string | null
          draw_odds: number | null
          home_odds: number | null
          home_team: string
          id: string
          league_id: number | null
          league_name: string
          match_id: string
          sport_key: string
          sport_title: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          away_odds?: number | null
          away_team: string
          commence_time: string
          created_at?: string | null
          draw_odds?: number | null
          home_odds?: number | null
          home_team: string
          id?: string
          league_id?: number | null
          league_name: string
          match_id: string
          sport_key: string
          sport_title: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          away_odds?: number | null
          away_team?: string
          commence_time?: string
          created_at?: string | null
          draw_odds?: number | null
          home_odds?: number | null
          home_team?: string
          id?: string
          league_id?: number | null
          league_name?: string
          match_id?: string
          sport_key?: string
          sport_title?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      n8n_events_log: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          processed: boolean | null
          source_workflow: string | null
        }
        Insert: {
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          processed?: boolean | null
          source_workflow?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          processed?: boolean | null
          source_workflow?: string | null
        }
        Relationships: []
      }
      nft_badges: {
        Row: {
          badge_name: string
          badge_type: string
          id: string
          metadata: Json | null
          minted_at: string | null
          rarity: string | null
          token_id: string | null
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          id?: string
          metadata?: Json | null
          minted_at?: string | null
          rarity?: string | null
          token_id?: string | null
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          id?: string
          metadata?: Json | null
          minted_at?: string | null
          rarity?: string | null
          token_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nlrc_reports: {
        Row: {
          active_players: number
          created_at: string | null
          exported_at: string | null
          gross_gaming_revenue: number
          id: string
          quarter: string
          quarter_number: number
          report_data: Json
          submitted_at: string | null
          submitted_by: string | null
          submitted_to_nlrc: boolean | null
          tax_payable: number
          total_players: number
          unpaid_tickets: number
          unpaid_tickets_value: number
          year: number
        }
        Insert: {
          active_players?: number
          created_at?: string | null
          exported_at?: string | null
          gross_gaming_revenue?: number
          id?: string
          quarter: string
          quarter_number: number
          report_data?: Json
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_to_nlrc?: boolean | null
          tax_payable?: number
          total_players?: number
          unpaid_tickets?: number
          unpaid_tickets_value?: number
          year: number
        }
        Update: {
          active_players?: number
          created_at?: string | null
          exported_at?: string | null
          gross_gaming_revenue?: number
          id?: string
          quarter?: string
          quarter_number?: number
          report_data?: Json
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_to_nlrc?: boolean | null
          tax_payable?: number
          total_players?: number
          unpaid_tickets?: number
          unpaid_tickets_value?: number
          year?: number
        }
        Relationships: []
      }
      payment_waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notified: boolean | null
          notified_at: string | null
          payment_method: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          payment_method: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          payment_method?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          notification_type: string
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pool_bets: {
        Row: {
          closes_at: string
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          max_members: number
          min_entry: number
          name: string
          potential_win: number
          selections_count: number
          sport: string
          status: string
          total_odds: number
          total_stake: number
          type: string
          updated_at: string | null
        }
        Insert: {
          closes_at: string
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          max_members?: number
          min_entry?: number
          name: string
          potential_win?: number
          selections_count?: number
          sport: string
          status?: string
          total_odds?: number
          total_stake?: number
          type?: string
          updated_at?: string | null
        }
        Update: {
          closes_at?: string
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          max_members?: number
          min_entry?: number
          name?: string
          potential_win?: number
          selections_count?: number
          sport?: string
          status?: string
          total_odds?: number
          total_stake?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pool_members: {
        Row: {
          id: string
          joined_at: string | null
          pool_id: string
          stake_amount: number
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          pool_id: string
          stake_amount: number
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          pool_id?: string
          stake_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_members_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_bets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number | null
          created_at: string | null
          currency_code: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency_code?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency_code?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      realtime_odds_cache: {
        Row: {
          id: string
          last_updated: string | null
          market: string
          match_id: string
          odds: Json
        }
        Insert: {
          id?: string
          last_updated?: string | null
          market: string
          match_id: string
          odds: Json
        }
        Update: {
          id?: string
          last_updated?: string | null
          market?: string
          match_id?: string
          odds?: Json
        }
        Relationships: []
      }
      regulatory_flags: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string | null
          deactivated_at: string | null
          flag_type: string
          id: string
          is_active: boolean
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          flag_type: string
          id?: string
          is_active?: boolean
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          flag_type?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      responsible_gaming_limits: {
        Row: {
          cooling_off_until: string | null
          created_at: string | null
          daily_loss_limit: number
          daily_stake_limit: number
          id: string
          self_excluded_until: string | null
          session_time_limit: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cooling_off_until?: string | null
          created_at?: string | null
          daily_loss_limit?: number
          daily_stake_limit?: number
          id?: string
          self_excluded_until?: string | null
          session_time_limit?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cooling_off_until?: string | null
          created_at?: string | null
          daily_loss_limit?: number
          daily_stake_limit?: number
          id?: string
          self_excluded_until?: string | null
          session_time_limit?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      retention_incentives: {
        Row: {
          amount: number
          credited_at: string | null
          days_inactive: number
          id: string
          incentive_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          credited_at?: string | null
          days_inactive: number
          id?: string
          incentive_type?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          credited_at?: string | null
          days_inactive?: number
          id?: string
          incentive_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          details: Json | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          details?: Json | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          details?: Json | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sms_delivery_log: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          message: string
          phone_number: string
          retry_count: number | null
          status: string
          telco_response: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          message: string
          phone_number: string
          retry_count?: number | null
          status?: string
          telco_response?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          message?: string
          phone_number?: string
          retry_count?: number | null
          status?: string
          telco_response?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_bets: {
        Row: {
          bet_slip_id: string
          caption: string | null
          copies_count: number | null
          created_at: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          user_id: string
        }
        Insert: {
          bet_slip_id: string
          caption?: string | null
          copies_count?: number | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          user_id: string
        }
        Update: {
          bet_slip_id?: string
          caption?: string | null
          copies_count?: number | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      social_feed_likes: {
        Row: {
          created_at: string | null
          id: string
          social_bet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          social_bet_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          social_bet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_feed_likes_social_bet_id_fkey"
            columns: ["social_bet_id"]
            isOneToOne: false
            referencedRelation: "social_bets"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_statistics: {
        Row: {
          bets_placed: number | null
          bets_won: number | null
          created_at: string | null
          id: string
          profit_loss: number | null
          sport: string
          total_returns: number | null
          total_staked: number | null
          updated_at: string | null
          user_id: string
          win_rate: number | null
        }
        Insert: {
          bets_placed?: number | null
          bets_won?: number | null
          created_at?: string | null
          id?: string
          profit_loss?: number | null
          sport: string
          total_returns?: number | null
          total_staked?: number | null
          updated_at?: string | null
          user_id: string
          win_rate?: number | null
        }
        Update: {
          bets_placed?: number | null
          bets_won?: number | null
          created_at?: string | null
          id?: string
          profit_loss?: number | null
          sport?: string
          total_returns?: number | null
          total_staked?: number | null
          updated_at?: string | null
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      sports_leagues: {
        Row: {
          confederation: string | null
          created_at: string | null
          id: string
          leagues: Json
          region: string | null
          sport_key: string
          sport_title: string
          updated_at: string | null
        }
        Insert: {
          confederation?: string | null
          created_at?: string | null
          id?: string
          leagues?: Json
          region?: string | null
          sport_key: string
          sport_title: string
          updated_at?: string | null
        }
        Update: {
          confederation?: string | null
          created_at?: string | null
          id?: string
          leagues?: Json
          region?: string | null
          sport_key?: string
          sport_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          created_at: string | null
          id: string
          points_earned: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          best_streak: number | null
          biggest_loss: number | null
          biggest_win: number | null
          created_at: string | null
          current_streak: number | null
          favorite_sport: string | null
          id: string
          profit_loss: number | null
          roi: number | null
          total_bets: number | null
          total_losses: number | null
          total_pending: number | null
          total_returns: number | null
          total_staked: number | null
          total_wins: number | null
          updated_at: string | null
          user_id: string
          win_rate: number | null
        }
        Insert: {
          best_streak?: number | null
          biggest_loss?: number | null
          biggest_win?: number | null
          created_at?: string | null
          current_streak?: number | null
          favorite_sport?: string | null
          id?: string
          profit_loss?: number | null
          roi?: number | null
          total_bets?: number | null
          total_losses?: number | null
          total_pending?: number | null
          total_returns?: number | null
          total_staked?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id: string
          win_rate?: number | null
        }
        Update: {
          best_streak?: number | null
          biggest_loss?: number | null
          biggest_win?: number | null
          created_at?: string | null
          current_streak?: number | null
          favorite_sport?: string | null
          id?: string
          profit_loss?: number | null
          roi?: number | null
          total_bets?: number | null
          total_losses?: number | null
          total_pending?: number | null
          total_returns?: number | null
          total_staked?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      vr_experiences: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          sport: string
          stadium_name: string
          status: string
          thumbnail_url: string | null
          viewer_count: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          sport: string
          stadium_name: string
          status?: string
          thumbnail_url?: string | null
          viewer_count?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          sport?: string
          stadium_name?: string
          status?: string
          thumbnail_url?: string | null
          viewer_count?: number
        }
        Relationships: []
      }
      vr_sessions: {
        Row: {
          duration_minutes: number | null
          ended_at: string | null
          experience_id: string
          id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          duration_minutes?: number | null
          ended_at?: string | null
          experience_id: string
          id?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          duration_minutes?: number | null
          ended_at?: string | null
          experience_id?: string
          id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vr_sessions_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "vr_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenges: {
        Row: {
          challenge_description: string | null
          challenge_name: string
          challenge_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          reward_points: number | null
          target_value: number
          updated_at: string | null
          week_start: string
        }
        Insert: {
          challenge_description?: string | null
          challenge_name: string
          challenge_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          target_value: number
          updated_at?: string | null
          week_start: string
        }
        Update: {
          challenge_description?: string | null
          challenge_name?: string
          challenge_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          target_value?: number
          updated_at?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_matches: {
        Row: {
          away_odds: number | null
          away_team: string | null
          draw_odds: number | null
          home_odds: number | null
          home_team: string | null
          id: string | null
          kickoff_at: string | null
          league_id: number | null
          league_name: string | null
          match_id: string | null
          sport_key: string | null
          sport_title: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          away_odds?: number | null
          away_team?: string | null
          draw_odds?: number | null
          home_odds?: number | null
          home_team?: string | null
          id?: string | null
          kickoff_at?: string | null
          league_id?: number | null
          league_name?: string | null
          match_id?: string | null
          sport_key?: string | null
          sport_title?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          away_odds?: number | null
          away_team?: string | null
          draw_odds?: number | null
          home_odds?: number | null
          home_team?: string | null
          id?: string | null
          kickoff_at?: string | null
          league_id?: number | null
          league_name?: string | null
          match_id?: string | null
          sport_key?: string | null
          sport_title?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_affiliate_ancestors: {
        Args: { p_user_id: string }
        Returns: {
          ancestor_id: string
        }[]
      }
      get_daily_usage: {
        Args: { p_user_id: string }
        Returns: {
          total_loss: number
          total_stake: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _admin_id: string
          _error_message?: string
          _ip_address?: string
          _mfa_verified?: boolean
          _payload_hash?: string
          _resource_id?: string
          _resource_type: string
          _status?: string
          _user_agent?: string
        }
        Returns: string
      }
      log_ledger_entry: {
        Args: {
          p_amount: number
          p_balance_after: number
          p_balance_before: number
          p_currency: string
          p_description?: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_reference_id?: string
          p_reference_type?: string
          p_transaction_type: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      log_slow_query: {
        Args: { p_duration_ms: number; p_query: string; p_user_id?: string }
        Returns: undefined
      }
      settle_game_bets: {
        Args: { p_session_id: string; p_winner: string }
        Returns: undefined
      }
      update_game_state: {
        Args: {
          p_current_player: string
          p_game_state: Json
          p_session_id: string
          p_winner?: string
        }
        Returns: {
          completed_at: string | null
          created_at: string | null
          current_player: string | null
          game_state: Json
          game_type: string
          id: string
          mode: string
          player1_id: string | null
          player2_id: string | null
          stake_amount: number | null
          started_at: string | null
          status: string | null
          winner: string | null
        }
        SetofOptions: {
          from: "*"
          to: "game_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      affiliate_tier: "BRONZE" | "SILVER" | "GOLD"
      app_role: "user" | "admin" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      affiliate_tier: ["BRONZE", "SILVER", "GOLD"],
      app_role: ["user", "admin", "superadmin"],
    },
  },
} as const
