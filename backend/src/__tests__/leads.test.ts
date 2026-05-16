import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

const adminUser = { name: 'Admin User', email: 'admin@example.com', password: 'Password123', role: 'admin' };
const agentUser = { name: 'Agent User', email: 'agent@example.com', password: 'Password123' };

const validLead = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@acme.com',
  company: 'Acme Corp',
  source: 'website',
  priority: 'high',
  status: 'new',
  value: 15000,
};

async function registerAndGetToken(userData: typeof adminUser | typeof agentUser): Promise<string> {
  const res = await request(app).post('/api/v1/auth/register').send(userData);
  return res.body.data.tokens.accessToken as string;
}

describe('Lead Routes', () => {
  let adminToken: string;
  let agentToken: string;

  beforeEach(async () => {
    adminToken = await registerAndGetToken(adminUser);
    agentToken = await registerAndGetToken(agentUser);
  });

  // ─── GET /api/v1/leads ────────────────────────────────────────────────────
  describe('GET /api/v1/leads', () => {
    it('should return empty list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/leads');
      expect(res.status).toBe(401);
    });

    it('should support pagination params', async () => {
      // seed 3 leads
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/leads')
          .set('Authorization', `Bearer ${agentToken}`)
          .send({ ...validLead, email: `lead${i}@test.com` });
      }

      const res = await request(app)
        .get('/api/v1/leads?page=1&limit=2')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(3);
      expect(res.body.data.pagination.pages).toBe(2);
    });

    it('should filter by status', async () => {
      await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ ...validLead, email: 'won@test.com', status: 'won' });

      await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ ...validLead, email: 'new@test.com', status: 'new' });

      const res = await request(app)
        .get('/api/v1/leads?status=won')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].status).toBe('won');
    });
  });

  // ─── POST /api/v1/leads ───────────────────────────────────────────────────
  describe('POST /api/v1/leads', () => {
    it('should create a lead for authenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(validLead);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Jane');
      expect(res.body.data.email).toBe('jane@acme.com');
      expect(res.body.data._id).toBeDefined();
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ firstName: 'Only' });

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ ...validLead, email: 'not-email' });

      expect(res.status).toBe(422);
    });

    it('should fail with invalid source value', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ ...validLead, source: 'invalid_source' });

      expect(res.status).toBe(422);
    });

    it('should fail without auth token', async () => {
      const res = await request(app).post('/api/v1/leads').send(validLead);
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/v1/leads/:id ────────────────────────────────────────────────
  describe('GET /api/v1/leads/:id', () => {
    it('should return a lead by id', async () => {
      const create = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(validLead);

      const id = create.body.data._id as string;
      const res = await request(app)
        .get(`/api/v1/leads/${id}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(id);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .get('/api/v1/leads/000000000000000000000000')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid mongo id', async () => {
      const res = await request(app)
        .get('/api/v1/leads/bad-id')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /api/v1/leads/:id ──────────────────────────────────────────────
  describe('PATCH /api/v1/leads/:id', () => {
    it('should update a lead', async () => {
      const create = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(validLead);

      const id = create.body.data._id as string;
      const res = await request(app)
        .patch(`/api/v1/leads/${id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ status: 'contacted', priority: 'low' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('contacted');
      expect(res.body.data.priority).toBe('low');
    });

    it('should fail with invalid status value', async () => {
      const create = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(validLead);

      const id = create.body.data._id as string;
      const res = await request(app)
        .patch(`/api/v1/leads/${id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(422);
    });
  });

  // ─── DELETE /api/v1/leads/:id ─────────────────────────────────────────────
  describe('DELETE /api/v1/leads/:id', () => {
    it('should allow admin to delete a lead', async () => {
      const create = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validLead);

      const id = create.body.data._id as string;
      const res = await request(app)
        .delete(`/api/v1/leads/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should deny agent from deleting a lead', async () => {
      const create = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(validLead);

      const id = create.body.data._id as string;
      const res = await request(app)
        .delete(`/api/v1/leads/${id}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent lead', async () => {
      const res = await request(app)
        .delete('/api/v1/leads/000000000000000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── GET /api/v1/leads/stats ──────────────────────────────────────────────
  describe('GET /api/v1/leads/stats', () => {
    it('should return stats for admin', async () => {
      await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validLead);

      const res = await request(app)
        .get('/api/v1/leads/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.byStatus).toBeDefined();
      expect(res.body.data.bySource).toBeDefined();
      expect(res.body.data.totalValue).toBeDefined();
    });

    it('should also allow agents to view stats', async () => {
      const res = await request(app)
        .get('/api/v1/leads/stats')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
    });
  });
});
