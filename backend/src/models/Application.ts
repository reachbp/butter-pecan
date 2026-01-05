import { query } from './database';
import { Application, CreateApplicationDTO, UpdateApplicationDTO } from './types';

/**
 * Application Model
 * Database operations for applications
 */

export class ApplicationModel {
  /**
   * Get all applications for a user (with school details)
   */
  static async findByUserId(userId: string): Promise<Application[]> {
    const result = await query(
      `SELECT
        a.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'short_name', s.short_name,
          'city', s.city,
          'grades_offered', s.grades_offered,
          'tuition_range', s.tuition_range,
          'school_type', s.school_type,
          'logo_url', s.logo_url
        ) as school
      FROM applications a
      JOIN schools s ON a.school_id = s.id
      WHERE a.user_id = $1
      ORDER BY
        CASE a.status
          WHEN 'considering' THEN 1
          WHEN 'applied' THEN 2
          WHEN 'interviewed' THEN 3
          WHEN 'accepted' THEN 4
          WHEN 'waitlisted' THEN 5
          WHEN 'rejected' THEN 6
          WHEN 'decided' THEN 7
        END,
        a.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get application by ID
   */
  static async findById(id: string): Promise<Application | null> {
    const result = await query(
      `SELECT
        a.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'short_name', s.short_name,
          'city', s.city,
          'grades_offered', s.grades_offered,
          'tuition_range', s.tuition_range,
          'school_type', s.school_type,
          'logo_url', s.logo_url
        ) as school
      FROM applications a
      JOIN schools s ON a.school_id = s.id
      WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get applications by status
   */
  static async findByStatus(userId: string, status: string): Promise<Application[]> {
    const result = await query(
      `SELECT
        a.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'short_name', s.short_name,
          'city', s.city,
          'grades_offered', s.grades_offered,
          'tuition_range', s.tuition_range,
          'school_type', s.school_type,
          'logo_url', s.logo_url
        ) as school
      FROM applications a
      JOIN schools s ON a.school_id = s.id
      WHERE a.user_id = $1 AND a.status = $2
      ORDER BY a.created_at DESC`,
      [userId, status]
    );
    return result.rows;
  }

  /**
   * Create a new application
   */
  static async create(userId: string, data: CreateApplicationDTO): Promise<Application> {
    const {
      school_id,
      grade_applying,
      application_year,
      status = 'considering',
    } = data;

    const result = await query(
      `INSERT INTO applications (
        user_id, school_id, grade_applying, application_year, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, school_id, grade_applying, application_year, status]
    );

    // Fetch with school details
    return await this.findById(result.rows[0].id) as Application;
  }

  /**
   * Update an application
   */
  static async update(id: string, userId: string, updates: UpdateApplicationDTO): Promise<Application | null> {
    const fields = Object.keys(updates)
      .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = Object.keys(updates)
      .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      .map((key) => updates[key as keyof UpdateApplicationDTO]);

    const result = await query(
      `UPDATE applications
       SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, ...values]
    );

    if (result.rowCount === 0) {
      return null;
    }

    // Fetch with school details
    return await this.findById(id);
  }

  /**
   * Delete an application
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get application statistics for a user
   */
  static async getStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    const result = await query(
      `SELECT
        COUNT(*) as total,
        status,
        COUNT(*) FILTER (WHERE status = 'considering') as considering,
        COUNT(*) FILTER (WHERE status = 'applied') as applied,
        COUNT(*) FILTER (WHERE status = 'interviewed') as interviewed,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'waitlisted') as waitlisted,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'decided') as decided
      FROM applications
      WHERE user_id = $1
      GROUP BY status`,
      [userId]
    );

    const total = result.rows.reduce((sum, row) => sum + parseInt(row.total), 0);
    const byStatus: Record<string, number> = {};

    result.rows.forEach((row) => {
      byStatus[row.status] = parseInt(row.total);
    });

    return { total, byStatus };
  }

  /**
   * Get applications with upcoming deadlines
   */
  static async getUpcomingDeadlines(userId: string, days: number = 7): Promise<Application[]> {
    const result = await query(
      `SELECT
        a.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'short_name', s.short_name,
          'city', s.city
        ) as school
      FROM applications a
      JOIN schools s ON a.school_id = s.id
      WHERE a.user_id = $1
      AND (
        (a.application_date IS NOT NULL AND a.application_date <= CURRENT_DATE + INTERVAL '${days} days')
        OR
        (a.interview_date IS NOT NULL AND a.interview_date <= CURRENT_DATE + INTERVAL '${days} days')
        OR
        (a.decision_date IS NOT NULL AND a.decision_date <= CURRENT_DATE + INTERVAL '${days} days')
      )
      ORDER BY
        COALESCE(a.application_date, a.interview_date, a.decision_date) ASC`,
      [userId]
    );
    return result.rows;
  }
}

export default ApplicationModel;
