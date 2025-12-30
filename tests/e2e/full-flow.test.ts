import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../src/server.ts'

describe('E2E API Tests', () => {
  let authToken: string
  let userId: string
  let organizationId: string

  const testUser = {
    email: 'user1@corpa.com',
    password: 'demo1234',
  }

  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body).contain({ status: 'OK' })
    })
  })

  describe('Authentication', () => {
    it('should login successfully and return a token', async () => {
      const res = await request(app).post('/api/auth/login').send(testUser)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('user')

      authToken = res.body.token
      userId = res.body.user.id
    })

    it('should fail with invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      })

      expect(res.status).toBe(401)
    })
  })

  describe('Users API', () => {
    it('should get all users (paginated) with Cache-Control header', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.users)).toBe(true)
      expect(res.body.users.length).toBe(10)
      expect(res.body).toHaveProperty('pagination')
      expect(res.body.pagination.totalCount).toBe(10)
      expect(res.body.pagination.hasNextPage).toBe(false)
      expect(res.body.pagination.hasPreviousPage).toBe(false)
      expect(res.headers['cache-control']).toBe('private, max-age=600')
    })

    it('should get current user details', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.user.id).toBe(userId)
      expect(res.body.user.email).toBe(testUser.email)
    })
  })

  describe('Organizations API', () => {
    it('should get all organizations with Cache-Control header', async () => {
      const res = await request(app)
        .get('/api/organizations')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.organizations)).toBe(true)
      expect(res.body.organizations.length).toBe(2)
      organizationId = res.body.organizations[0].id
      expect(res.body.pagination.totalCount).toBe(2)
      expect(res.headers['cache-control']).toBe('private, max-age=600')
    })

    it('should get user organization details', async () => {
      const res = await request(app)
        .get(`/api/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.organization.id).toBe(organizationId)
    })
  })

  describe('Orders API', () => {
    let createdOrderId: string
    let ordersEtag: string

    it('should get all orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.orders)).toBe(true)
      expect(res.body.orders.length).toBe(10)
      expect(res.body).toHaveProperty('pagination')
      expect(res.body.pagination.hasNextPage).toBe(true)
      expect(res.body.pagination.hasPreviousPage).toBe(false)
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(10)
      expect(res.body.pagination.totalCount).toBe(20)
    })

    it('should return ETag header for orders list', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.headers['etag']).toBeDefined()
      expect(res.headers['etag']).toMatch(/^"[a-f0-9]{32}"$/)
      expect(res.headers['cache-control']).toBe('private, no-cache')
      ordersEtag = res.headers['etag']
    })

    it('should return 304 Not Modified when ETag matches for orders list', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('If-None-Match', ordersEtag)

      expect(res.status).toBe(304)
      expect(res.body).toEqual("") // No body on 304
    })

    it('should create a new order', async () => {
      const newOrder = {
        totalAmount: 150,
      }

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOrder)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('order')
      expect(res.body.order.totalAmount).toBe(150)
      createdOrderId = res.body.order.id
    })

    it('should return different ETag after order is created', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.headers['etag']).toBeDefined()
      // ETag should be different now since data changed
      expect(res.headers['etag']).not.toBe(ordersEtag)
    })

    it('should delete the created order', async () => {
      const res = await request(app)
        .delete(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(getRes.status).toBe(404)
    })
  })
})
