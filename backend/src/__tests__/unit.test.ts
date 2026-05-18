import { AppError } from '../utils/errors';
import { createLeadSchema, registerSchema, loginSchema } from '../validators/schemas';

// ─── AppError ────────────────────────────────────────────────────────────────
describe('AppError', () => {
  it('creates error with correct status code', () => {
    const err = new AppError('Test error', 400);
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(400);
    expect(err.isOperational).toBe(true);
  });

  it('defaults to 500 status', () => {
    const err = new AppError('Server error');
    expect(err.statusCode).toBe(500);
  });

  it('creates 404 via static notFound()', () => {
    const err = AppError.notFound('Lead');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Lead not found');
  });

  it('creates 401 via static unauthorized()', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
  });

  it('creates 403 via static forbidden()', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
  });

  it('creates 409 via static conflict()', () => {
    const err = AppError.conflict('Email exists');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email exists');
  });

  it('stores validation errors', () => {
    const errors = { email: ['Invalid email'] };
    const err = AppError.badRequest('Validation failed', errors);
    expect(err.errors).toEqual(errors);
    expect(err.statusCode).toBe(400);
  });
});

// ─── Validators ──────────────────────────────────────────────────────────────
describe('registerSchema', () => {
  const valid = { body: { name: 'Test User', email: 'test@example.com', password: 'Password1' } };

  it('accepts valid registration data', () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({ body: { ...valid.body, name: 'A' } });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ body: { ...valid.body, email: 'bad' } });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({ body: { ...valid.body, password: 'password1' } });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({ body: { ...valid.body, password: 'Password' } });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({ body: { ...valid.body, password: 'Pa1' } });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ body: { email: 'a@b.com', password: 'anypass' } });
    expect(result.success).toBe(true);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ body: { email: 'a@b.com' } });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ body: { email: 'notanemail', password: 'pass' } });
    expect(result.success).toBe(false);
  });
});

describe('createLeadSchema', () => {
  const validLead = {
    body: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      source: 'website',
    },
  };

  it('accepts minimal valid lead', () => {
    const result = createLeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('rejects missing source', () => {
  const { source, ...rest } = validLead.body;

  const result = createLeadSchema.safeParse({
    body: rest,
  });

  expect(result.success).toBe(false);
});

  it('rejects invalid source enum', () => {
    const result = createLeadSchema.safeParse({ body: { ...validLead.body, source: 'fax_machine' } });
    expect(result.success).toBe(false);
  });

  it('rejects negative value', () => {
    const result = createLeadSchema.safeParse({ body: { ...validLead.body, value: -1 } });
    expect(result.success).toBe(false);
  });

  it('rejects overly long notes', () => {
    const result = createLeadSchema.safeParse({ body: { ...validLead.body, notes: 'x'.repeat(2001) } });
    expect(result.success).toBe(false);
  });

  it('accepts all optional fields', () => {
    const result = createLeadSchema.safeParse({
      body: {
        ...validLead.body,
        phone: '1234567890',
        company: 'ACME',
        jobTitle: 'CEO',
        status: 'qualified',
        priority: 'high',
        value: 50000,
        notes: 'Great prospect',
        tags: ['hot', 'enterprise'],
      },
    });
    expect(result.success).toBe(true);
  });
});
