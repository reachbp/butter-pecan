import request from 'supertest';
import { app } from '../index';
import { ApplicationModel } from '../models/Application';
import { SchoolModel } from '../models/School';
import { pool } from '../models/database';

/**
 * Application API Integration Tests
 */

describe('Application API', () => {
  let testSchoolId: string;
  let testApplicationId: string;
  const TEST_USER_ID = 'test-user-123';

  beforeAll(async () => {
    // Create a test school for applications
    const school = await SchoolModel.create({
      name: 'Test Application School',
      city: 'San Francisco',
      grades_offered: 'K-12',
    });
    testSchoolId = school.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testApplicationId) {
      await ApplicationModel.delete(testApplicationId, TEST_USER_ID);
    }
    if (testSchoolId) {
      await SchoolModel.delete(testSchoolId);
    }
    await pool.end();
  });

  describe('POST /api/applications', () => {
    it('should create a new application', async () => {
      const newApplication = {
        school_id: testSchoolId,
        grade_applying: '9',
        application_year: 2026,
        status: 'considering',
      };

      const response = await request(app)
        .post('/api/applications')
        .send(newApplication)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.application).toHaveProperty('id');
      expect(response.body.application.school_id).toBe(testSchoolId);
      expect(response.body.application.grade_applying).toBe('9');

      testApplicationId = response.body.application.id;
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidApplication = {
        grade_applying: '9',
      };

      const response = await request(app)
        .post('/api/applications')
        .send(invalidApplication)
        .expect(400);

      expect(response.body.error.message).toContain('school_id');
    });
  });

  describe('GET /api/applications', () => {
    it('should return all applications for user', async () => {
      const response = await request(app)
        .get('/api/applications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('applications');
      expect(Array.isArray(response.body.applications)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter applications by status', async () => {
      const response = await request(app)
        .get('/api/applications?status=considering')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.applications.forEach((app: any) => {
        expect(app.status).toBe('considering');
      });
    });

    it('should include school details in response', async () => {
      const response = await request(app)
        .get('/api/applications')
        .expect(200);

      if (response.body.applications.length > 0) {
        const app = response.body.applications[0];
        expect(app).toHaveProperty('school');
        expect(app.school).toHaveProperty('name');
        expect(app.school).toHaveProperty('city');
      }
    });
  });

  describe('GET /api/applications/stats', () => {
    it('should return application statistics', async () => {
      const response = await request(app)
        .get('/api/applications/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('byStatus');
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should return a specific application', async () => {
      const response = await request(app)
        .get(`/api/applications/${testApplicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.application.id).toBe(testApplicationId);
    });

    it('should return 404 for non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/applications/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/applications/:id', () => {
    it('should update application status', async () => {
      const updates = {
        status: 'applied',
        application_date: '2026-01-15',
        notes: 'Application submitted online',
      };

      const response = await request(app)
        .put(`/api/applications/${testApplicationId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.application.status).toBe('applied');
      expect(response.body.application.notes).toBe('Application submitted online');
    });

    it('should return 404 when updating non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .put(`/api/applications/${fakeId}`)
        .send({ status: 'applied' })
        .expect(404);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete an application', async () => {
      // Create a new application to delete
      const app = await ApplicationModel.create(TEST_USER_ID, {
        school_id: testSchoolId,
        grade_applying: '10',
        application_year: 2026,
      });

      const response = await request(app)
        .delete(`/api/applications/${app.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await ApplicationModel.findById(app.id);
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/api/applications/${fakeId}`)
        .expect(404);
    });
  });
});

/**
 * Application Model Unit Tests
 */
describe('ApplicationModel', () => {
  let testSchoolId: string;
  let testApplicationId: string;
  const TEST_USER_ID = 'test-user-456';

  beforeAll(async () => {
    const school = await SchoolModel.create({
      name: 'Model Test School',
      city: 'Oakland',
      grades_offered: '9-12',
    });
    testSchoolId = school.id;
  });

  afterAll(async () => {
    if (testApplicationId) {
      await ApplicationModel.delete(testApplicationId, TEST_USER_ID);
    }
    if (testSchoolId) {
      await SchoolModel.delete(testSchoolId);
    }
    await pool.end();
  });

  describe('create', () => {
    it('should create a new application', async () => {
      const application = await ApplicationModel.create(TEST_USER_ID, {
        school_id: testSchoolId,
        grade_applying: '9',
        application_year: 2026,
      });

      expect(application).toHaveProperty('id');
      expect(application.user_id).toBe(TEST_USER_ID);
      expect(application.school_id).toBe(testSchoolId);
      expect(application.status).toBe('considering'); // default

      testApplicationId = application.id;
    });
  });

  describe('findByUserId', () => {
    it('should return applications for a user', async () => {
      const applications = await ApplicationModel.findByUserId(TEST_USER_ID);
      expect(Array.isArray(applications)).toBe(true);
      expect(applications.length).toBeGreaterThan(0);
      expect(applications[0]).toHaveProperty('school');
    });

    it('should return empty array for user with no applications', async () => {
      const applications = await ApplicationModel.findByUserId('non-existent-user');
      expect(applications).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return application by ID', async () => {
      const application = await ApplicationModel.findById(testApplicationId);
      expect(application).not.toBeNull();
      expect(application?.id).toBe(testApplicationId);
      expect(application).toHaveProperty('school');
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const application = await ApplicationModel.findById(fakeId);
      expect(application).toBeNull();
    });
  });

  describe('update', () => {
    it('should update application fields', async () => {
      const updates = {
        status: 'interviewed' as const,
        interview_date: '2026-02-01',
        notes: 'Great interview!',
      };

      const updated = await ApplicationModel.update(
        testApplicationId,
        TEST_USER_ID,
        updates
      );

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('interviewed');
      expect(updated?.notes).toBe('Great interview!');
    });

    it('should return null for non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updated = await ApplicationModel.update(fakeId, TEST_USER_ID, {
        status: 'applied',
      });
      expect(updated).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return application statistics', async () => {
      const stats = await ApplicationModel.getStats(TEST_USER_ID);
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byStatus');
      expect(typeof stats.total).toBe('number');
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  describe('findByStatus', () => {
    it('should return applications with specific status', async () => {
      const applications = await ApplicationModel.findByStatus(
        TEST_USER_ID,
        'interviewed'
      );
      applications.forEach(app => {
        expect(app.status).toBe('interviewed');
      });
    });
  });

  describe('delete', () => {
    it('should delete application', async () => {
      // Create one to delete
      const app = await ApplicationModel.create(TEST_USER_ID, {
        school_id: testSchoolId,
        grade_applying: '11',
        application_year: 2026,
      });

      const deleted = await ApplicationModel.delete(app.id, TEST_USER_ID);
      expect(deleted).toBe(true);

      // Verify it's gone
      const found = await ApplicationModel.findById(app.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent application', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const deleted = await ApplicationModel.delete(fakeId, TEST_USER_ID);
      expect(deleted).toBe(false);
    });
  });
});
