import { Router, Request, Response } from 'express';
import { validateJoiObject } from './Joi/index';
import { userRegistrationSchema, userAuthenticationSchema } from './Joi/auth';
import { generateToken } from '../utils/jwt';
import User from '../models/User';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * @swagger
 * /api/auth/authUser:
 *   get:
 *     summary: Authenticate a user and return a JWT token
 *     description: |
 *       Authenticate a user using their credentials and return a JWT token if successful
 *     tags:
 *       - Authentication
 *     parameters:
 *       - name: email
 *         in: query
 *         description: User's email | Min length 7, Max length 50
 *         required: true
 *         type: string
 *       - name: password
 *         in: query
 *         description: User's password | Min length 8, Max length 50
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: JWT token if authentication is successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

router.get('/authUser', async (req: Request, res: Response) => {
    try {

        // JOI input validation
        const { valid, data, errors } = validateJoiObject(req.query, userAuthenticationSchema);

        if (!valid && errors) {
            const formattedErrors = errors.map(err => ({
                message: err.message,
                path: err.path.join('.')
            }));

            return res.status(400).json({ 
                message: 'Validation error',
                errors: formattedErrors
            });
        }

        const { email, password } = data;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Checks the input password with the hashed one
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // returns a JWT in case the user and password are valid
        const token = generateToken({ id: user.id, email: user.email });

        res.json({ token });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

/**
 * @swagger
 * /api/auth/createUser:
 *   post:
 *     summary: Create a user in the database and return a JWT token
 *     description: Create a user in the database, hash the password, and return a JWT token if successful
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name | Min length 3, Max length 50
 *               email:
 *                 type: string
 *                 description: User's email | Min length 5, Max length 30
 *               password:
 *                 type: string
 *                 description: User's password | Min length 8, Max length 50
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.post('/createUser', async (req: Request, res: Response) => {
    try {

        // JOI input validation
        const { valid, data, errors } = validateJoiObject(req.body, userRegistrationSchema);

        if (!valid && errors) {
            const formattedErrors = errors.map(err => ({
                message: err.message,
                path: err.path.join('.')
            }));

            return res.status(400).json({ 
                message: 'Validation error',
                errors: formattedErrors
            });
        }
    
        // Creates the user and hashes the password
        const { name, email, password } = data;
        const user = User.build({ name, email, password });
        await user.hashPassword();
        const newUser = await user.save();

        // Generates and returns a JWT
        const token = generateToken({ id: newUser.id, email: newUser.email });

        res.status(200).json({ 
            message: 'User created successfully', 
            token: token
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

export default router;
