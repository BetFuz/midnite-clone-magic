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
      app_role: ["user", "admin", "superadmin"],
    },
  },
} as const
