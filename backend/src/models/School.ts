import { query } from './database';
import { School } from './types';

/**
 * School Model
 * Database operations for schools
 */

export class SchoolModel {
  /**
   * Get all active schools
   */
  static async findAll(): Promise<School[]> {
    const result = await query(
      'SELECT * FROM schools WHERE active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  /**
   * Get school by ID
   */
  static async findById(id: string): Promise<School | null> {
    const result = await query(
      'SELECT * FROM schools WHERE id = $1 AND active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Search schools by name
   */
  static async search(searchTerm: string): Promise<School[]> {
    const result = await query(
      `SELECT * FROM schools
       WHERE active = true
       AND (name ILIKE $1 OR short_name ILIKE $1)
       ORDER BY name ASC`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  }

  /**
   * Get schools by city
   */
  static async findByCity(city: string): Promise<School[]> {
    const result = await query(
      'SELECT * FROM schools WHERE city = $1 AND active = true ORDER BY name ASC',
      [city]
    );
    return result.rows;
  }

  /**
   * Get schools by type
   */
  static async findByType(schoolType: string): Promise<School[]> {
    const result = await query(
      'SELECT * FROM schools WHERE school_type = $1 AND active = true ORDER BY name ASC',
      [schoolType]
    );
    return result.rows;
  }

  /**
   * Get schools by grades offered (contains check)
   */
  static async findByGrade(grade: string): Promise<School[]> {
    const result = await query(
      `SELECT * FROM schools
       WHERE active = true
       AND grades_offered ILIKE $1
       ORDER BY name ASC`,
      [`%${grade}%`]
    );
    return result.rows;
  }

  /**
   * Create a new school
   */
  static async create(schoolData: Partial<School>): Promise<School> {
    const {
      name,
      short_name,
      address,
      city,
      state,
      zip_code,
      website_url,
      grades_offered,
      tuition_range,
      school_type,
      description,
      logo_url,
    } = schoolData;

    const result = await query(
      `INSERT INTO schools (
        name, short_name, address, city, state, zip_code,
        website_url, grades_offered, tuition_range, school_type,
        description, logo_url, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      RETURNING *`,
      [
        name,
        short_name,
        address,
        city || 'San Francisco',
        state || 'CA',
        zip_code,
        website_url,
        grades_offered,
        tuition_range,
        school_type,
        description,
        logo_url,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a school
   */
  static async update(id: string, updates: Partial<School>): Promise<School | null> {
    const fields = Object.keys(updates)
      .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.keys(updates)
      .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      .map((key) => updates[key as keyof School]);

    const result = await query(
      `UPDATE schools SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Soft delete a school (set active = false)
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE schools SET active = false WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get school count by city
   */
  static async getCountByCity(): Promise<{ city: string; count: number }[]> {
    const result = await query(
      `SELECT city, COUNT(*) as count
       FROM schools
       WHERE active = true
       GROUP BY city
       ORDER BY count DESC`
    );
    return result.rows;
  }

  /**
   * Get school count by type
   */
  static async getCountByType(): Promise<{ school_type: string; count: number }[]> {
    const result = await query(
      `SELECT school_type, COUNT(*) as count
       FROM schools
       WHERE active = true
       GROUP BY school_type
       ORDER BY count DESC`
    );
    return result.rows;
  }
}

export default SchoolModel;
