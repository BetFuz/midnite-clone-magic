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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
