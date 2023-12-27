import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import { startServer } from '../mocks/app';
import User from '../../src/models/User';
import { getServerInstance } from '../globalSetup';
import sequelize from '../../src/utils/database';

chai.use(chaiHttp);
const expect = chai.expect;

describe('User API', () => {
    let application: request.SuperAgentTest;
    let jwtToken: string;

    before(async () => {
        try {
            const { app } = await getServerInstance();
            application = request(app) as any;

            await User.destroy({ where: {}, truncate: true });
            await sequelize.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');

            const user = await application.post('/api/auth/createUser').send({
                name: 'Test User 1',
                email: 'testuser1@example.com',
                password: 'password123',
            })

            await application.post('/api/auth/createUser').send({
                name: 'Test User 2',
                email: 'testuser2@example.com',
                password: 'password123',
            })

            await application.post('/api/auth/createUser').send({
                name: 'Test User 3',
                email: 'testuser3@example.com',
                password: 'password123',
            })
    
    
            jwtToken = user.body.token;

        } catch (error) {
            console.error('Error in before hook:', error);
            throw error;
        }
    });

    describe('GET /api/user/getAllUsers', () => {
        it('should return all users', async () => {
            const res = await application.get('/api/user/getAllUsers')
                .set('Authorization', `Bearer ${jwtToken}`);
                
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(3);
        });
    
        it('should return unauthorized error for invalid JWT token', async () => {
            const invalidToken = 'invalidToken';

            const res = await application.get('/api/user/getAllUsers')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(res).to.have.status(403);
        });

        it('should return unauthorized error for empty JWT token', async () => {
            const res = await application.get('/api/user/getAllUsers')

            expect(res).to.have.status(401);
        });
    });

    describe('GET /api/user/getUserById/{id}', () => {
        it('should return user by ID', async () => {
            const res = await application.get('/api/user/getUserById/1')
                .set('Authorization', `Bearer ${jwtToken}`);
            expect(res).to.have.status(200);
            expect(res.body.name).to.equal('Test User 1');
            expect(res.body.email).to.equal('testuser1@example.com');
        });
    
        it('should return an error for invalid ID', async () => {
            const res = await application.get('/api/user/getUserById/invalidId')
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(res).to.have.status(400);
        });
    
        it('should return user not found for non-existent user ID', async () => {
            const nonExistentUserId = 9999;
            const res = await application.get(`/api/user/getUserById/${nonExistentUserId}`)
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(res).to.have.status(404);
        });
    

        it('should return unauthorized error for invalid JWT token', async () => {
            const invalidToken = 'invalidToken';

            const res = await application.get('/api/user/getAllUsers')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(res).to.have.status(403);
        });

        it('should return unauthorized error for empty JWT token', async () => {
            const res = await application.get('/api/user/getAllUsers')

            expect(res).to.have.status(401)
        });
    });

    describe('DELETE /api/user/deleteUserById/{id}', () => {
        it('should delete a user by ID', async () => {
            const res = await application.delete('/api/user/deleteUserById/1')
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(res).to.have.status(200)
            
            const users = await application.get('/api/user/getAllUsers')
                .set('Authorization', `Bearer ${jwtToken}`);
                
            expect(users).to.have.status(200);
            expect(users.body).to.be.an('array');
            expect(users.body).to.have.length(2);
        });

        it('should return 404 due to invalid id', async () => {
            const res = await application.put('/api/user/deleteUserById/123')
            .set('Authorization', `Bearer ${jwtToken}`);

            expect(res).to.have.status(404);
        });

        it('should return unauthorized error for invalid JWT token', async () => {
            const invalidToken = 'invalidToken';

            const res = await application.get('/api/user/getAllUsers')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(res).to.have.status(403);
        });

        it('should return unauthorized error for empty JWT token', async () => {
            const res = await application.get('/api/user/getAllUsers')

            expect(res).to.have.status(401)
        });
    });

    describe('PUT /api/user/updateUserById/{id}', () => {
        it('should update user email by ID', async () => {
            const res = await application.put('/api/user/updateUserById/3')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ email: 'updateduser1@example.com' });

            expect(res).to.have.status(200);

            const user = await application.get('/api/user/getUserById/3')
                .set('Authorization', `Bearer ${jwtToken}`);
                
            expect(user).to.have.status(200);
            expect(user.body.name).to.equal('Test User 3');
            expect(user.body.email).to.equal('updateduser1@example.com');
        });

        it('should return 404 due to invalid id', async () => {
            const res = await application.put('/api/user/updateUserById/32')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ email: 'updateduser1@example.com' });

            expect(res).to.have.status(404);
        });

        it('should return unauthorized error for invalid JWT token', async () => {
            const invalidToken = 'invalidToken';

            const res = await application.get('/api/user/getAllUsers')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(res).to.have.status(403);
        });

        it('should return unauthorized error for empty JWT token', async () => {
            const res = await application.get('/api/user/getAllUsers')

            expect(res).to.have.status(401)
        });
    });
});
