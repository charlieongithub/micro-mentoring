import jwt from 'jsonwebtoken';
import {CONFIG} from '../../config';

export const getToken = (user: any): string => {
    return jwt.sign({ user }, CONFIG.JWT_SECRET, { expiresIn: '1d' })
};
