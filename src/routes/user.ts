import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../utils/jwt';
import User from '../models/User';
import { validateJoiObject } from './Joi/index';
import { userIdSchema, useremailSchema } from './Joi/user';
import { checkCache, setCache, invalidateCache } from '../utils/redis';


const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * /api/user/getAllUsers:
 *   get:
 *     summary: Get all users
 *     description: Get a list of all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - JWT token missing or not provided
 *       403:
 *         description: Forbidden - Invalid or expired JWT token
 */

router.get('/getAllUsers', authenticateToken, async (req: Request, res: Response) => {
    // GETs all the users
    return User.findAll()
        .then((users) => {
            return res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        })
});

/**
 * @swagger
 * /api/user/getUserById/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get a user by their ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User's ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - JWT token missing
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       404:
 *         description: User not found
 */

router.get('/getUserById/:id', authenticateToken, checkCache, async (req: Request, res: Response, next: NextFunction) => {
    try {

        // JOI input validation
        const { valid, data, errors } = validateJoiObject(req.params, userIdSchema);

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

        // GETs the user
        const { id } = data;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sends it to redis to then return the user
        res.locals.user = user;
        return next();

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
}, setCache);

/**
 * @swagger
 * /api/user/deleteUserById/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a user by its ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User's ID to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User successfully deleted
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.delete('/deleteUserById/:id', authenticateToken, invalidateCache, async (req: Request, res: Response) => {
    try {

        // JOI input validation
        const { valid, data, errors } = validateJoiObject(req.params, userIdSchema);

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

        // GETs the user
        const { id } = data;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If found, deletes it from the DB
        await user.destroy();
        res.status(200).json({ message: 'User successfully deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/user/updateUserById/{id}:
 *   put:
 *     summary: Update user's email
 *     description: Update a user's email by its ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the user to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The new email to update
 *     responses:
 *       200:
 *         description: User's email successfully updated
 *       400:
 *         description: Validation error for ID or email
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put('/updateUserById/:id', invalidateCache, authenticateToken, async (req: Request, res: Response) => {
    try {

        // JOI input validation for id
        const userIdValidationResult = validateJoiObject(req.params, userIdSchema);

        if (!userIdValidationResult.valid && userIdValidationResult.errors) {
            const formattedErrors = userIdValidationResult.errors.map(err => ({
                message: err.message,
                path: err.path.join('.')
            }));

            return res.status(400).json({ 
                message: 'Validation error',
                errors: formattedErrors
            });
        }

        // JOI input validation for email
        const emailValidationResult = validateJoiObject(req.body, useremailSchema);

        if (!emailValidationResult.valid && emailValidationResult.errors) {
            const formattedErrors = emailValidationResult.errors.map((err) => ({
                message: err.message,
                path: err.path.join('.')
            }));

            return res.status(400).json({ 
                message: 'Validation error',
                errors: formattedErrors
            });
        }

        const { id } = req.params;
        const { email } = req.body;

        // GETs the user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Updates the email and update date
        user.email = email;
        user.updateDate = new Date();
        await user.save();

        res.status(200).json({ user: {
            id: user.id,
            name: user.name,
            email: user.email,
            creationDate: user.creationDate,
            updateDate: user.updateDate
        }});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
