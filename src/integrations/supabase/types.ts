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
      advertising_logs: {
        Row: {
          channel: string
          compliance_footer: string
          created_at: string | null
          helpline_included: boolean
          id: string
          message_content: string
          message_type: string
          sent_at: string
          user_id: string | null
        }
        Insert: {
          channel: string
          compliance_footer: string
          created_at?: string | null
          helpline_included?: boolean
          id?: string
          message_content: string
          message_type: string
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          compliance_footer?: string
          created_at?: string | null
          helpline_included?: boolean
          id?: string
          message_content?: string
          message_type?: string
          sent_at?: string
          user_id?: string | null
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
      bet_builder_selections: {
        Row: {
          bet_slip_id: string | null
          correlation_factor: number | null
          created_at: string | null
          id: string
          match_id: string
          odds: number
          selection_type: string
          selection_value: string
        }
        Insert: {
          bet_slip_id?: string | null
          correlation_factor?: number | null
          created_at?: string | null
          id?: string
          match_id: string
          odds: number
          selection_type: string
          selection_value: string
        }
        Update: {
          bet_slip_id?: string | null
          correlation_factor?: number | null
          created_at?: string | null
          id?: string
          match_id?: string
          odds?: number
          selection_type?: string
          selection_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_builder_selections_bet_slip_id_fkey"
            columns: ["bet_slip_id"]
            isOneToOne: false
            referencedRelation: "bet_slips"
            referencedColumns: ["id"]
          },
        ]
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
      bet_delays: {
        Row: {
          bet_slip_id: string
          created_at: string | null
          decided_at: string | null
          decision_reason: string | null
          delay_seconds: number
          expires_at: string
          id: string
          league: string
          match_id: string
          potential_win: number
          status: string
          submitted_at: string
          total_stake: number
          trader_id: string | null
          user_id: string
        }
        Insert: {
          bet_slip_id: string
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          delay_seconds?: number
          expires_at: string
          id?: string
          league: string
          match_id: string
          potential_win: number
          status?: string
          submitted_at?: string
          total_stake: number
          trader_id?: string | null
          user_id: string
        }
        Update: {
          bet_slip_id?: string
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          delay_seconds?: number
          expires_at?: string
          id?: string
          league?: string
          match_id?: string
          potential_win?: number
          status?: string
          submitted_at?: string
          total_stake?: number
          trader_id?: string | null
          user_id?: string
        }
        Relationships: []
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
      bonus_abuse_flags: {
        Row: {
          created_at: string | null
          details: Json | null
          device_fingerprint: string | null
          flag_type: string
          id: string
          ip_address: unknown
          related_user_ids: string[] | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string | null
          flag_type: string
          id?: string
          ip_address?: unknown
          related_user_ids?: string[] | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string | null
          flag_type?: string
          id?: string
          ip_address?: unknown
          related_user_ids?: string[] | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      bonus_forfeitures: {
        Row: {
          balance_adjusted: boolean | null
          bonus_id: string
          bonus_type: string
          created_at: string | null
          forfeited_amount: number
          id: string
          reason: string | null
          rollover_cleared: number
          rollover_remaining: number
          user_id: string
        }
        Insert: {
          balance_adjusted?: boolean | null
          bonus_id: string
          bonus_type: string
          created_at?: string | null
          forfeited_amount: number
          id?: string
          reason?: string | null
          rollover_cleared?: number
          rollover_remaining: number
          user_id: string
        }
        Update: {
          balance_adjusted?: boolean | null
          bonus_id?: string
          bonus_type?: string
          created_at?: string | null
          forfeited_amount?: number
          id?: string
          reason?: string | null
          rollover_cleared?: number
          rollover_remaining?: number
          user_id?: string
        }
        Relationships: []
      }
      bonus_rollover: {
        Row: {
          bonus_id: string
          bonus_type: string
          completed: number
          completed_at: string | null
          created_at: string | null
          forfeited_at: string | null
          id: string
          min_odds: number | null
          remaining: number
          status: string
          total_required: number
          user_id: string
        }
        Insert: {
          bonus_id: string
          bonus_type: string
          completed?: number
          completed_at?: string | null
          created_at?: string | null
          forfeited_at?: string | null
          id?: string
          min_odds?: number | null
          remaining: number
          status?: string
          total_required: number
          user_id: string
        }
        Update: {
          bonus_id?: string
          bonus_type?: string
          completed?: number
          completed_at?: string | null
          created_at?: string | null
          forfeited_at?: string | null
          id?: string
          min_odds?: number | null
          remaining?: number
          status?: string
          total_required?: number
          user_id?: string
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
      early_payouts: {
        Row: {
          accepted_at: string | null
          bet_slip_id: string
          created_at: string | null
          early_payout_amount: number
          id: string
          monte_carlo_probability: number
          offer_expires_at: string
          original_potential_win: number
          remaining_legs: number
          settled_legs: number
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          bet_slip_id: string
          created_at?: string | null
          early_payout_amount: number
          id?: string
          monte_carlo_probability: number
          offer_expires_at: string
          original_potential_win: number
          remaining_legs: number
          settled_legs: number
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          bet_slip_id?: string
          created_at?: string | null
          early_payout_amount?: number
          id?: string
          monte_carlo_probability?: number
          offer_expires_at?: string
          original_potential_win?: number
          remaining_legs?: number
          settled_legs?: number
          status?: string
          user_id?: string
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
      fantasy_contest_entries: {
        Row: {
          contest_id: string | null
          created_at: string | null
          current_points: number | null
          current_rank: number | null
          entry_number: number
          id: string
          lineup_id: string | null
          prize_won: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contest_id?: string | null
          created_at?: string | null
          current_points?: number | null
          current_rank?: number | null
          entry_number: number
          id?: string
          lineup_id?: string | null
          prize_won?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contest_id?: string | null
          created_at?: string | null
          current_points?: number | null
          current_rank?: number | null
          entry_number?: number
          id?: string
          lineup_id?: string | null
          prize_won?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "fantasy_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_contest_entries_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
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
      fantasy_contests: {
        Row: {
          allows_late_swap: boolean | null
          allows_multi_entry: boolean | null
          contest_type_id: string | null
          created_at: string | null
          current_entries: number | null
          entry_fee: number
          id: string
          is_beginner_only: boolean | null
          late_swap_deadline: string | null
          league_id: string | null
          max_entries: number
          max_entries_per_user: number | null
          name: string
          prize_pool: number
          starts_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          allows_late_swap?: boolean | null
          allows_multi_entry?: boolean | null
          contest_type_id?: string | null
          created_at?: string | null
          current_entries?: number | null
          entry_fee: number
          id?: string
          is_beginner_only?: boolean | null
          late_swap_deadline?: string | null
          league_id?: string | null
          max_entries: number
          max_entries_per_user?: number | null
          name: string
          prize_pool: number
          starts_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          allows_late_swap?: boolean | null
          allows_multi_entry?: boolean | null
          contest_type_id?: string | null
          created_at?: string | null
          current_entries?: number | null
          entry_fee?: number
          id?: string
          is_beginner_only?: boolean | null
          late_swap_deadline?: string | null
          league_id?: string | null
          max_entries?: number
          max_entries_per_user?: number | null
          name?: string
          prize_pool?: number
          starts_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_contests_contest_type_id_fkey"
            columns: ["contest_type_id"]
            isOneToOne: false
            referencedRelation: "fantasy_contest_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_contests_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_gameweeks: {
        Row: {
          created_at: string | null
          deadline: string
          gameweek_number: number
          id: string
          is_current: boolean | null
          is_finished: boolean | null
          league_id: string
        }
        Insert: {
          created_at?: string | null
          deadline: string
          gameweek_number: number
          id?: string
          is_current?: boolean | null
          is_finished?: boolean | null
          league_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string
          gameweek_number?: number
          id?: string
          is_current?: boolean | null
          is_finished?: boolean | null
          league_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_gameweeks_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_h2h_matches: {
        Row: {
          away_lineup_id: string
          away_points: number | null
          created_at: string | null
          gameweek_number: number
          home_lineup_id: string
          home_points: number | null
          id: string
          league_id: string
          winner_lineup_id: string | null
        }
        Insert: {
          away_lineup_id: string
          away_points?: number | null
          created_at?: string | null
          gameweek_number: number
          home_lineup_id: string
          home_points?: number | null
          id?: string
          league_id: string
          winner_lineup_id?: string | null
        }
        Update: {
          away_lineup_id?: string
          away_points?: number | null
          created_at?: string | null
          gameweek_number?: number
          home_lineup_id?: string
          home_points?: number | null
          id?: string
          league_id?: string
          winner_lineup_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_h2h_matches_away_lineup_id_fkey"
            columns: ["away_lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_h2h_matches_home_lineup_id_fkey"
            columns: ["home_lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_h2h_matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
        ]
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
      fantasy_lineup_exports: {
        Row: {
          created_at: string | null
          expires_at: string | null
          export_code: string
          export_data: Json
          id: string
          lineup_id: string | null
          times_imported: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          export_code: string
          export_data: Json
          id?: string
          lineup_id?: string | null
          times_imported?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          export_code?: string
          export_data?: Json
          id?: string
          lineup_id?: string | null
          times_imported?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_lineup_exports_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
            referencedColumns: ["id"]
          },
        ]
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
      fantasy_matchups: {
        Row: {
          created_at: string | null
          difficulty_rating: number | null
          id: string
          match_date: string
          opponent_def_rating: number | null
          opponent_rank: number | null
          opponent_team: string
          over_under: number | null
          player_id: string | null
          vegas_line: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty_rating?: number | null
          id?: string
          match_date: string
          opponent_def_rating?: number | null
          opponent_rank?: number | null
          opponent_team: string
          over_under?: number | null
          player_id?: string | null
          vegas_line?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty_rating?: number | null
          id?: string
          match_date?: string
          opponent_def_rating?: number | null
          opponent_rank?: number | null
          opponent_team?: string
          over_under?: number | null
          player_id?: string | null
          vegas_line?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_matchups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_player_news: {
        Row: {
          content: string | null
          created_at: string | null
          headline: string
          id: string
          impact: string | null
          news_type: string | null
          player_id: string | null
          published_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          headline: string
          id?: string
          impact?: string | null
          news_type?: string | null
          player_id?: string | null
          published_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          headline?: string
          id?: string
          impact?: string | null
          news_type?: string | null
          player_id?: string | null
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_player_news_player_id_fkey"
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
      fantasy_player_stats: {
        Row: {
          assists: number | null
          clean_sheet: boolean | null
          clearances: number | null
          created_at: string | null
          fantasy_points: number | null
          game_date: string
          goals: number | null
          id: string
          interceptions: number | null
          match_id: string | null
          minutes_played: number | null
          pass_accuracy: number | null
          passes_completed: number | null
          player_id: string | null
          red_cards: number | null
          saves: number | null
          shots: number | null
          shots_on_target: number | null
          tackles: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          clean_sheet?: boolean | null
          clearances?: number | null
          created_at?: string | null
          fantasy_points?: number | null
          game_date: string
          goals?: number | null
          id?: string
          interceptions?: number | null
          match_id?: string | null
          minutes_played?: number | null
          pass_accuracy?: number | null
          passes_completed?: number | null
          player_id?: string | null
          red_cards?: number | null
          saves?: number | null
          shots?: number | null
          shots_on_target?: number | null
          tackles?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          clean_sheet?: boolean | null
          clearances?: number | null
          created_at?: string | null
          fantasy_points?: number | null
          game_date?: string
          goals?: number | null
          id?: string
          interceptions?: number | null
          match_id?: string | null
          minutes_played?: number | null
          pass_accuracy?: number | null
          passes_completed?: number | null
          player_id?: string | null
          red_cards?: number | null
          saves?: number | null
          shots?: number | null
          shots_on_target?: number | null
          tackles?: number | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_player_stats_player_id_fkey"
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
          club_id: string | null
          created_at: string | null
          cross_sport_tags: string[] | null
          dual_sport_eligible: boolean | null
          external_player_id: string
          form_rating: number | null
          full_name: string
          id: string
          injury_status: string | null
          metadata: Json | null
          minutes_played: number | null
          position: string
          price_change: number | null
          projected_points: number | null
          salary: number
          secondary_position: string | null
          sport: string
          team: string
          updated_at: string | null
        }
        Insert: {
          average_points?: number | null
          club_id?: string | null
          created_at?: string | null
          cross_sport_tags?: string[] | null
          dual_sport_eligible?: boolean | null
          external_player_id: string
          form_rating?: number | null
          full_name: string
          id?: string
          injury_status?: string | null
          metadata?: Json | null
          minutes_played?: number | null
          position: string
          price_change?: number | null
          projected_points?: number | null
          salary?: number
          secondary_position?: string | null
          sport: string
          team: string
          updated_at?: string | null
        }
        Update: {
          average_points?: number | null
          club_id?: string | null
          created_at?: string | null
          cross_sport_tags?: string[] | null
          dual_sport_eligible?: boolean | null
          external_player_id?: string
          form_rating?: number | null
          full_name?: string
          id?: string
          injury_status?: string | null
          metadata?: Json | null
          minutes_played?: number | null
          position?: string
          price_change?: number | null
          projected_points?: number | null
          salary?: number
          secondary_position?: string | null
          sport?: string
          team?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fantasy_prizes: {
        Row: {
          awarded_at: string | null
          awarded_to_user_id: string | null
          created_at: string | null
          gameweek_number: number | null
          id: string
          league_id: string
          prize_amount: number
          prize_description: string
          prize_type: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_to_user_id?: string | null
          created_at?: string | null
          gameweek_number?: number | null
          id?: string
          league_id: string
          prize_amount: number
          prize_description: string
          prize_type: string
        }
        Update: {
          awarded_at?: string | null
          awarded_to_user_id?: string | null
          created_at?: string | null
          gameweek_number?: number | null
          id?: string
          league_id?: string
          prize_amount?: number
          prize_description?: string
          prize_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_prizes_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
        ]
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
      fantasy_transfers: {
        Row: {
          created_at: string | null
          gameweek_number: number
          id: string
          lineup_id: string
          player_in_id: string
          player_out_id: string
          transfer_cost: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gameweek_number: number
          id?: string
          lineup_id: string
          player_in_id: string
          player_out_id: string
          transfer_cost?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gameweek_number?: number
          id?: string
          lineup_id?: string
          player_in_id?: string
          player_out_id?: string
          transfer_cost?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_transfers_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_transfers_player_in_id_fkey"
            columns: ["player_in_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_transfers_player_out_id_fkey"
            columns: ["player_out_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_user_chips: {
        Row: {
          available: boolean | null
          chip_type: string
          created_at: string | null
          id: string
          league_id: string
          used_gameweek: number | null
          user_id: string
        }
        Insert: {
          available?: boolean | null
          chip_type: string
          created_at?: string | null
          id?: string
          league_id: string
          used_gameweek?: number | null
          user_id: string
        }
        Update: {
          available?: boolean | null
          chip_type?: string
          created_at?: string | null
          id?: string
          league_id?: string
          used_gameweek?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_user_chips_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fantasy_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_weekly_lineups: {
        Row: {
          bench: Json
          captain_id: string | null
          chip_used: string | null
          created_at: string | null
          formation: string
          gameweek_number: number
          id: string
          lineup_id: string
          points_scored: number | null
          starting_xi: Json
          updated_at: string | null
          vice_captain_id: string | null
        }
        Insert: {
          bench?: Json
          captain_id?: string | null
          chip_used?: string | null
          created_at?: string | null
          formation?: string
          gameweek_number: number
          id?: string
          lineup_id: string
          points_scored?: number | null
          starting_xi?: Json
          updated_at?: string | null
          vice_captain_id?: string | null
        }
        Update: {
          bench?: Json
          captain_id?: string | null
          chip_used?: string | null
          created_at?: string | null
          formation?: string
          gameweek_number?: number
          id?: string
          lineup_id?: string
          points_scored?: number | null
          starting_xi?: Json
          updated_at?: string | null
          vice_captain_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_weekly_lineups_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_weekly_lineups_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "fantasy_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_weekly_lineups_vice_captain_id_fkey"
            columns: ["vice_captain_id"]
            isOneToOne: false
            referencedRelation: "fantasy_players"
            referencedColumns: ["id"]
          },
        ]
      }
      free_bet_tokens: {
        Row: {
          amount: number
          bet_slip_id: string | null
          expires_at: string
          id: string
          issued_at: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          source: string | null
          status: string
          terms: Json | null
          token_code: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bet_slip_id?: string | null
          expires_at: string
          id?: string
          issued_at?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          source?: string | null
          status?: string
          terms?: Json | null
          token_code: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bet_slip_id?: string | null
          expires_at?: string
          id?: string
          issued_at?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          source?: string | null
          status?: string
          terms?: Json | null
          token_code?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      high_risk_leagues: {
        Row: {
          bet_delay_seconds: number
          created_at: string | null
          id: string
          is_active: boolean
          league_name: string
          max_stake_limit: number | null
          requires_trader_approval: boolean
          risk_level: string
          sport: string
          updated_at: string | null
        }
        Insert: {
          bet_delay_seconds?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          league_name: string
          max_stake_limit?: number | null
          requires_trader_approval?: boolean
          risk_level: string
          sport: string
          updated_at?: string | null
        }
        Update: {
          bet_delay_seconds?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          league_name?: string
          max_stake_limit?: number | null
          requires_trader_approval?: boolean
          risk_level?: string
          sport?: string
          updated_at?: string | null
        }
        Relationships: []
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
      market_exposure: {
        Row: {
          bet_count: number
          created_at: string | null
          id: string
          is_suspended: boolean
          last_updated: string
          market_type: string
          match_id: string
          max_liability_threshold: number
          selection_value: string
          suspended_at: string | null
          suspended_by: string | null
          total_liability: number
          total_stakes: number
        }
        Insert: {
          bet_count?: number
          created_at?: string | null
          id?: string
          is_suspended?: boolean
          last_updated?: string
          market_type: string
          match_id: string
          max_liability_threshold?: number
          selection_value: string
          suspended_at?: string | null
          suspended_by?: string | null
          total_liability?: number
          total_stakes?: number
        }
        Update: {
          bet_count?: number
          created_at?: string | null
          id?: string
          is_suspended?: boolean
          last_updated?: string
          market_type?: string
          match_id?: string
          max_liability_threshold?: number
          selection_value?: string
          suspended_at?: string | null
          suspended_by?: string | null
          total_liability?: number
          total_stakes?: number
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
      odds_overrides: {
        Row: {
          applied_at: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          market_type: string
          match_id: string
          original_odds: number
          override_odds: number
          reason: string | null
          selection_value: string
          trader_id: string
        }
        Insert: {
          applied_at?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          market_type: string
          match_id: string
          original_odds: number
          override_odds: number
          reason?: string | null
          selection_value: string
          trader_id: string
        }
        Update: {
          applied_at?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          market_type?: string
          match_id?: string
          original_odds?: number
          override_odds?: number
          reason?: string | null
          selection_value?: string
          trader_id?: string
        }
        Relationships: []
      }
      official_data_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          is_official: boolean
          league: string
          priority: number
          provider: string
          sport: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_official?: boolean
          league: string
          priority?: number
          provider: string
          sport: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_official?: boolean
          league?: string
          priority?: number
          provider?: string
          sport?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parimutuel_bets: {
        Row: {
          actual_payout: number | null
          created_at: string | null
          id: string
          pool_id: string
          potential_dividend: number | null
          selections: Json
          stake_amount: number
          status: string
          units: number
          user_id: string
        }
        Insert: {
          actual_payout?: number | null
          created_at?: string | null
          id?: string
          pool_id: string
          potential_dividend?: number | null
          selections: Json
          stake_amount: number
          status?: string
          units: number
          user_id: string
        }
        Update: {
          actual_payout?: number | null
          created_at?: string | null
          id?: string
          pool_id?: string
          potential_dividend?: number | null
          selections?: Json
          stake_amount?: number
          status?: string
          units?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parimutuel_bets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "parimutuel_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      parimutuel_pools: {
        Row: {
          closed_at: string | null
          created_at: string | null
          id: string
          platform_commission: number
          pool_type: string
          race_id: string
          race_start_time: string
          race_type: string
          settled_at: string | null
          status: string
          total_pool: number
          winning_selections: Json | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          id?: string
          platform_commission?: number
          pool_type: string
          race_id: string
          race_start_time: string
          race_type: string
          settled_at?: string | null
          status?: string
          total_pool?: number
          winning_selections?: Json | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          id?: string
          platform_commission?: number
          pool_type?: string
          race_id?: string
          race_start_time?: string
          race_type?: string
          settled_at?: string | null
          status?: string
          total_pool?: number
          winning_selections?: Json | null
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
      player_props: {
        Row: {
          created_at: string | null
          feed_provider: string
          id: string
          line: number
          market_status: string | null
          match_id: string
          over_odds: number
          player_name: string
          prop_type: string
          team: string
          under_odds: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feed_provider: string
          id?: string
          line: number
          market_status?: string | null
          match_id: string
          over_odds: number
          player_name: string
          prop_type: string
          team: string
          under_odds: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feed_provider?: string
          id?: string
          line?: number
          market_status?: string | null
          match_id?: string
          over_odds?: number
          player_name?: string
          prop_type?: string
          team?: string
          under_odds?: number
          updated_at?: string | null
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
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          is_age_verified: boolean | null
          nin_verification_status: string | null
          phone: string | null
          state_code: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency_code?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          is_age_verified?: boolean | null
          nin_verification_status?: string | null
          phone?: string | null
          state_code?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency_code?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_age_verified?: boolean | null
          nin_verification_status?: string | null
          phone?: string | null
          state_code?: string | null
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
      sar_filings: {
        Row: {
          amount_24h: number
          created_at: string | null
          filed_at: string | null
          id: string
          pattern_details: Json | null
          status: string
          transaction_count: number
          trigger_type: string
          updated_at: string | null
          user_id: string
          xml_content: string | null
          xml_path: string | null
        }
        Insert: {
          amount_24h?: number
          created_at?: string | null
          filed_at?: string | null
          id?: string
          pattern_details?: Json | null
          status?: string
          transaction_count?: number
          trigger_type: string
          updated_at?: string | null
          user_id: string
          xml_content?: string | null
          xml_path?: string | null
        }
        Update: {
          amount_24h?: number
          created_at?: string | null
          filed_at?: string | null
          id?: string
          pattern_details?: Json | null
          status?: string
          transaction_count?: number
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
          xml_content?: string | null
          xml_path?: string | null
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
      self_exclusion_registry: {
        Row: {
          created_at: string | null
          exclusion_type: string
          expires_at: string | null
          id: string
          nlrc_reference_id: string | null
          nlrc_sync_status: string | null
          reason: string | null
          requested_at: string
          synced_to_nlrc_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exclusion_type: string
          expires_at?: string | null
          id?: string
          nlrc_reference_id?: string | null
          nlrc_sync_status?: string | null
          reason?: string | null
          requested_at?: string
          synced_to_nlrc_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exclusion_type?: string
          expires_at?: string | null
          id?: string
          nlrc_reference_id?: string | null
          nlrc_sync_status?: string | null
          reason?: string | null
          requested_at?: string
          synced_to_nlrc_at?: string | null
          updated_at?: string | null
          user_id?: string
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
      state_tax_rates: {
        Row: {
          created_at: string | null
          effective_from: string
          id: string
          state_code: string
          state_name: string
          tax_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_from?: string
          id?: string
          state_code: string
          state_name: string
          tax_rate: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string
          id?: string
          state_code?: string
          state_name?: string
          tax_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      streaming_sessions: {
        Row: {
          bet_placed: boolean | null
          ended_at: string | null
          id: string
          match_id: string
          session_token: string | null
          started_at: string | null
          stream_provider: string
          user_id: string
        }
        Insert: {
          bet_placed?: boolean | null
          ended_at?: string | null
          id?: string
          match_id: string
          session_token?: string | null
          started_at?: string | null
          stream_provider?: string
          user_id: string
        }
        Update: {
          bet_placed?: boolean | null
          ended_at?: string | null
          id?: string
          match_id?: string
          session_token?: string | null
          started_at?: string | null
          stream_provider?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_accruals: {
        Row: {
          created_at: string | null
          gross_gaming_revenue: number
          id: string
          period_end: string
          period_start: string
          remitted_at: string | null
          state_code: string
          status: string
          tax_amount: number
          tax_rate: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gross_gaming_revenue?: number
          id?: string
          period_end: string
          period_start: string
          remitted_at?: string | null
          state_code: string
          status?: string
          tax_amount: number
          tax_rate: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gross_gaming_revenue?: number
          id?: string
          period_end?: string
          period_start?: string
          remitted_at?: string | null
          state_code?: string
          status?: string
          tax_amount?: number
          tax_rate?: number
          updated_at?: string | null
          user_id?: string
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
      calculate_fantasy_points: {
        Args: { p_player_id: string; p_position: string; p_stats: Json }
        Returns: number
      }
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
