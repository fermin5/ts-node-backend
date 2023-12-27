import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import User from '../../src/models/User';
import { getServerInstance } from '../globalSetup';

chai.should();
chai.use(chaiHttp);

describe('Authentication API', () => {
    let application: request.SuperAgentTest;

    let testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    before(async () => {
        try {
            const { app } = await getServerInstance();
            application = request(app) as any;
            await User.destroy({ where: {}, truncate: true });
      
        } catch (error) {
            console.error('Error in before hook:', error);
            throw error;
        }
      });

    describe('POST /api/auth/createUser', () => {
        it('should create a user and return a JWT token', async () => {
            const res = await application.post('/api/auth/createUser').send(testUser);

            res.should.have.status(200);
            res.body.should.have.property('message', 'User created successfully');
            res.body.should.have.property('token');
        });

        it('should return a 400 validation error for invalid data', async () => {
            const invalidUser = {
                name: 'Valid User Name',
                email: 'wrong_email_format',
                password: 'ValidPassword'
            };

            const res = await application.post('/api/auth/createUser').send(invalidUser);

            res.should.have.status(400);
            res.body.should.have.property('message', 'Validation error');
        });

    });

    describe('GET /api/auth/authUser', () => {
        it('should authenticate a user and return a JWT token', async () => {
            const res = await application
                .get('/api/auth/authUser')
                .query({ email: testUser.email, password: testUser.password });

            res.should.have.status(200);
            res.body.should.have.property('token');
        });

        it('should return a 401 invalid credentials error for wrong password', async () => {
            const res = await application.get('/api/auth/authUser')
                .query({ email: testUser.email, password: 'wrong_password' });

            res.should.have.status(401);
            res.body.should.have.property('message', 'Invalid credentials');
        });

        it('should return a 400 validation error for invalid data', async () => {
            const res = await application.get('/api/auth/authUser')
                .query({ email: 'wrong_email_format', password: testUser.password });

            res.should.have.status(400);
            res.body.should.have.property('message', 'Validation error');
        });
    });
});
