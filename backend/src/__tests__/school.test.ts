import request from 'supertest';
import { app } from '../index';
import { SchoolModel } from '../models/School';
import { pool } from '../models/database';

/**
 * School API Integration Tests
 * Tests the /api/schools endpoints
 */

describe('School API', () => {
  // Setup: Create a test school for use in tests
  let testSchoolId: string;

  beforeAll(async () => {
    // Create a test school
    const testSchool = await SchoolModel.create({
      name: 'Test School',
      short_name: 'Test',
      address: '123 Test St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      website_url: 'https://test.edu',
      grades_offered: 'K-12',
      tuition_range: '$50,000',
      school_type: 'Independent',
      description: 'A test school for unit testing',
    });
    testSchoolId = testSchool.id;
  });

  afterAll(async () => {
    // Clean up: Delete test school
    if (testSchoolId) {
      await SchoolModel.delete(testSchoolId);
    }
    // Close database connection
    await pool.end();
  });

  describe('GET /api/schools', () => {
    it('should return all schools', async () => {
      const response = await request(app)
        .get('/api/schools')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('schools');
      expect(Array.isArray(response.body.schools)).toBe(true);
      expect(response.body.schools.length).toBeGreaterThan(0);
    });

    it('should search schools by name', async () => {
      const response = await request(app)
        .get('/api/schools?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.schools.length).toBeGreaterThan(0);
      expect(response.body.schools[0].name).toContain('Test');
    });

    it('should filter schools by city', async () => {
      const response = await request(app)
        .get('/api/schools?city=San Francisco')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.schools.length).toBeGreaterThan(0);
      response.body.schools.forEach((school: any) => {
        expect(school.city).toBe('San Francisco');
      });
    });

    it('should filter schools by type', async () => {
      const response = await request(app)
        .get('/api/schools?type=Independent')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.schools.forEach((school: any) => {
        expect(school.school_type).toBe('Independent');
      });
    });
  });

  describe('GET /api/schools/:id', () => {
    it('should return a specific school by ID', async () => {
      const response = await request(app)
        .get(`/api/schools/${testSchoolId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.school).toHaveProperty('id', testSchoolId);
      expect(response.body.school).toHaveProperty('name', 'Test School');
    });

    it('should return 404 for non-existent school', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/schools/${fakeId}`)
        .expect(404);

      expect(response.body.error).toHaveProperty('message', 'School not found');
    });
  });

  describe('GET /api/schools/stats/summary', () => {
    it('should return school statistics summary', async () => {
      const response = await request(app)
        .get('/api/schools/stats/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('byCity');
      expect(response.body.summary).toHaveProperty('byType');
      expect(Array.isArray(response.body.summary.byCity)).toBe(true);
      expect(Array.isArray(response.body.summary.byType)).toBe(true);
    });
  });

  describe('POST /api/schools', () => {
    it('should create a new school', async () => {
      const newSchool = {
        name: 'New Test School',
        short_name: 'NTS',
        city: 'Oakland',
        grades_offered: '9-12',
        tuition_range: '$45,000',
        school_type: 'Independent',
      };

      const response = await request(app)
        .post('/api/schools')
        .send(newSchool)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.school).toHaveProperty('name', 'New Test School');
      expect(response.body.school).toHaveProperty('id');

      // Clean up
      await SchoolModel.delete(response.body.school.id);
    });

    it('should return 400 when name is missing', async () => {
      const invalidSchool = {
        city: 'Oakland',
      };

      const response = await request(app)
        .post('/api/schools')
        .send(invalidSchool)
        .expect(400);

      expect(response.body.error).toHaveProperty('message', 'School name is required');
    });
  });

  describe('PUT /api/schools/:id', () => {
    it('should update a school', async () => {
      const updates = {
        description: 'Updated test description',
        tuition_range: '$55,000',
      };

      const response = await request(app)
        .put(`/api/schools/${testSchoolId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.school).toHaveProperty('description', 'Updated test description');
      expect(response.body.school).toHaveProperty('tuition_range', '$55,000');
    });

    it('should return 404 when updating non-existent school', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/schools/${fakeId}`)
        .send({ description: 'Test' })
        .expect(404);

      expect(response.body.error).toHaveProperty('message', 'School not found');
    });
  });

  describe('DELETE /api/schools/:id', () => {
    it('should delete a school (soft delete)', async () => {
      // Create a school to delete
      const schoolToDelete = await SchoolModel.create({
        name: 'School To Delete',
        city: 'San Francisco',
      });

      const response = await request(app)
        .delete(`/api/schools/${schoolToDelete.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('School deleted successfully');

      // Verify it's soft deleted (should not appear in findById)
      const deletedSchool = await SchoolModel.findById(schoolToDelete.id);
      expect(deletedSchool).toBeNull();
    });

    it('should return 404 when deleting non-existent school', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/schools/${fakeId}`)
        .expect(404);

      expect(response.body.error).toHaveProperty('message', 'School not found');
    });
  });
});

/**
 * School Model Unit Tests
 * Tests the SchoolModel class methods directly
 */
describe('SchoolModel', () => {
  let testSchoolId: string;

  beforeAll(async () => {
    const testSchool = await SchoolModel.create({
      name: 'Model Test School',
      city: 'Palo Alto',
      grades_offered: 'K-8',
      school_type: 'Progressive',
    });
    testSchoolId = testSchool.id;
  });

  afterAll(async () => {
    if (testSchoolId) {
      await SchoolModel.delete(testSchoolId);
    }
    await pool.end();
  });

  describe('findAll', () => {
    it('should return array of schools', async () => {
      const schools = await SchoolModel.findAll();
      expect(Array.isArray(schools)).toBe(true);
      expect(schools.length).toBeGreaterThan(0);
    });

    it('should return only active schools', async () => {
      const schools = await SchoolModel.findAll();
      schools.forEach(school => {
        expect(school.active).toBe(true);
      });
    });
  });

  describe('findById', () => {
    it('should return school by ID', async () => {
      const school = await SchoolModel.findById(testSchoolId);
      expect(school).not.toBeNull();
      expect(school?.id).toBe(testSchoolId);
      expect(school?.name).toBe('Model Test School');
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const school = await SchoolModel.findById(fakeId);
      expect(school).toBeNull();
    });
  });

  describe('search', () => {
    it('should find schools matching search term', async () => {
      const results = await SchoolModel.search('Model Test');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Model Test');
    });

    it('should return empty array for non-matching search', async () => {
      const results = await SchoolModel.search('NonExistentSchoolXYZ123');
      expect(results).toEqual([]);
    });
  });

  describe('findByCity', () => {
    it('should return schools in specific city', async () => {
      const schools = await SchoolModel.findByCity('Palo Alto');
      expect(schools.length).toBeGreaterThan(0);
      schools.forEach(school => {
        expect(school.city).toBe('Palo Alto');
      });
    });
  });

  describe('findByType', () => {
    it('should return schools of specific type', async () => {
      const schools = await SchoolModel.findByType('Progressive');
      expect(schools.length).toBeGreaterThan(0);
      schools.forEach(school => {
        expect(school.school_type).toBe('Progressive');
      });
    });
  });

  describe('getCountByCity', () => {
    it('should return school counts grouped by city', async () => {
      const counts = await SchoolModel.getCountByCity();
      expect(Array.isArray(counts)).toBe(true);
      expect(counts.length).toBeGreaterThan(0);
      expect(counts[0]).toHaveProperty('city');
      expect(counts[0]).toHaveProperty('count');
      expect(typeof counts[0].count).toBe('string'); // pg returns count as string
    });
  });

  describe('getCountByType', () => {
    it('should return school counts grouped by type', async () => {
      const counts = await SchoolModel.getCountByType();
      expect(Array.isArray(counts)).toBe(true);
      expect(counts.length).toBeGreaterThan(0);
      expect(counts[0]).toHaveProperty('school_type');
      expect(counts[0]).toHaveProperty('count');
    });
  });
});
