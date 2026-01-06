import { query } from './database';

/**
 * Community Data Model
 * Manages community-contributed application data and aggregated statistics
 */

export interface CommunityContribution {
  id: string;
  user_id: string;
  school_id: string;
  application_year: number;
  grade_applied?: string;
  acceptance_status?: 'accepted' | 'waitlisted' | 'rejected';
  gender?: string;
  legacy_status?: boolean;
  standardized_test_score?: number;
  application_submitted_date?: string;
  interview_date?: string;
  decision_received_date?: string;
  application_difficulty_rating?: number;
  interview_difficulty_rating?: number;
  overall_experience_rating?: number;
  financial_aid_received?: boolean;
  financial_aid_amount_range?: string;
  is_verified: boolean;
  is_public: boolean;
  verification_method?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolCommunityStats {
  id: string;
  school_id: string;
  application_year: number;
  total_contributions: number;
  acceptance_rate?: number;
  waitlist_rate?: number;
  rejection_rate?: number;
  avg_application_difficulty?: number;
  avg_interview_difficulty?: number;
  avg_overall_experience?: number;
  financial_aid_percentage?: number;
  avg_days_to_interview?: number;
  avg_days_to_decision?: number;
  last_updated: string;
  created_at: string;
}

export interface UserDataSharingPreferences {
  id: string;
  user_id: string;
  share_outcomes: boolean;
  share_timeline: boolean;
  share_ratings: boolean;
  share_demographics: boolean;
  share_financial_aid: boolean;
  always_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContributionDTO {
  school_id: string;
  application_year: number;
  grade_applied?: string;
  acceptance_status?: 'accepted' | 'waitlisted' | 'rejected';
  gender?: string;
  legacy_status?: boolean;
  standardized_test_score?: number;
  application_submitted_date?: string;
  interview_date?: string;
  decision_received_date?: string;
  application_difficulty_rating?: number;
  interview_difficulty_rating?: number;
  overall_experience_rating?: number;
  financial_aid_received?: boolean;
  financial_aid_amount_range?: string;
}

export interface UpdateSharingPreferencesDTO {
  share_outcomes?: boolean;
  share_timeline?: boolean;
  share_ratings?: boolean;
  share_demographics?: boolean;
  share_financial_aid?: boolean;
  always_anonymous?: boolean;
}

export class CommunityDataModel {
  /**
   * Get user's data sharing preferences
   */
  static async getSharingPreferences(userId: string): Promise<UserDataSharingPreferences | null> {
    const result = await query(
      'SELECT * FROM user_data_sharing_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create or update data sharing preferences
   */
  static async upsertSharingPreferences(
    userId: string,
    preferences: UpdateSharingPreferencesDTO
  ): Promise<UserDataSharingPreferences> {
    const fields = Object.keys(preferences);
    const values = Object.values(preferences);

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const result = await query(
      `INSERT INTO user_data_sharing_preferences (user_id, ${fields.join(', ')})
       VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(', ')})
       ON CONFLICT (user_id)
       DO UPDATE SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, ...values, ...values]
    );

    return result.rows[0];
  }

  /**
   * Create a new community contribution
   */
  static async createContribution(
    userId: string,
    data: CreateContributionDTO
  ): Promise<CommunityContribution> {
    // Get user's sharing preferences
    const preferences = await this.getSharingPreferences(userId);
    const isPublic = preferences ? preferences.share_outcomes : true;

    const fields = Object.keys(data);
    const values = Object.values(data);

    const result = await query(
      `INSERT INTO community_contributions (
        user_id, ${fields.join(', ')}, is_public
      ) VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(', ')}, $${fields.length + 2})
      RETURNING *`,
      [userId, ...values, isPublic]
    );

    return result.rows[0];
  }

  /**
   * Get user's contributions
   */
  static async findByUserId(userId: string): Promise<CommunityContribution[]> {
    const result = await query(
      `SELECT c.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'city', s.city
        ) as school
      FROM community_contributions c
      JOIN schools s ON c.school_id = s.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get contribution by ID
   */
  static async findById(id: string): Promise<CommunityContribution | null> {
    const result = await query(
      'SELECT * FROM community_contributions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Update a contribution
   */
  static async updateContribution(
    id: string,
    userId: string,
    updates: Partial<CreateContributionDTO>
  ): Promise<CommunityContribution | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(', ');

    const result = await query(
      `UPDATE community_contributions
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a contribution
   */
  static async deleteContribution(id: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM community_contributions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get school community stats for a specific year
   */
  static async getSchoolStats(
    schoolId: string,
    year: number
  ): Promise<SchoolCommunityStats | null> {
    const result = await query(
      'SELECT * FROM school_community_stats WHERE school_id = $1 AND application_year = $2',
      [schoolId, year]
    );
    return result.rows[0] || null;
  }

  /**
   * Get school community stats for multiple years
   */
  static async getSchoolStatsHistory(
    schoolId: string,
    yearsBack: number = 3
  ): Promise<SchoolCommunityStats[]> {
    const currentYear = new Date().getFullYear() + 1; // Application year is typically next year
    const startYear = currentYear - yearsBack;

    const result = await query(
      `SELECT * FROM school_community_stats
       WHERE school_id = $1 AND application_year >= $2
       ORDER BY application_year DESC`,
      [schoolId, startYear]
    );
    return result.rows;
  }

  /**
   * Get anonymized contributions for a school (for public display)
   */
  static async getPublicContributions(
    schoolId: string,
    year: number,
    limit: number = 50
  ): Promise<Partial<CommunityContribution>[]> {
    // Return only anonymized, non-identifying data
    const result = await query(
      `SELECT
        acceptance_status,
        grade_applied,
        application_difficulty_rating,
        interview_difficulty_rating,
        overall_experience_rating,
        financial_aid_received,
        DATE_PART('year', application_submitted_date) as application_year_only,
        DATE_PART('month', application_submitted_date) as application_month
      FROM community_contributions
      WHERE school_id = $1
        AND application_year = $2
        AND is_public = TRUE
      ORDER BY created_at DESC
      LIMIT $3`,
      [schoolId, year, limit]
    );
    return result.rows;
  }

  /**
   * Get top schools by acceptance rate
   */
  static async getTopSchoolsByAcceptanceRate(
    year: number,
    limit: number = 10
  ): Promise<any[]> {
    const result = await query(
      `SELECT
        scs.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'city', s.city,
          'school_type', s.school_type
        ) as school
      FROM school_community_stats scs
      JOIN schools s ON scs.school_id = s.id
      WHERE scs.application_year = $1
        AND scs.total_contributions >= 5
      ORDER BY scs.acceptance_rate DESC
      LIMIT $2`,
      [year, limit]
    );
    return result.rows;
  }

  /**
   * Get comparison data for multiple schools
   */
  static async compareSchools(
    schoolIds: string[],
    year: number
  ): Promise<any[]> {
    const result = await query(
      `SELECT
        scs.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'city', s.city,
          'school_type', s.school_type,
          'tuition_range', s.tuition_range
        ) as school
      FROM school_community_stats scs
      JOIN schools s ON scs.school_id = s.id
      WHERE scs.school_id = ANY($1)
        AND scs.application_year = $2
      ORDER BY s.name`,
      [schoolIds, year]
    );
    return result.rows;
  }

  /**
   * Manually recalculate stats for a school
   */
  static async recalculateStats(schoolId: string, year: number): Promise<void> {
    await query('SELECT recalculate_school_stats($1, $2)', [schoolId, year]);
  }
}

export default CommunityDataModel;
