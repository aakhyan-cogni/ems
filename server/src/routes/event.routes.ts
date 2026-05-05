// import { Router } from "express";
// import { getEvents } from "@/controllers/event.controller";

// export const eventRouter = Router();

// eventRouter.get("/", getEvents);

import { Router } from 'express';
import * as ctrl from '@/controllers/event.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { consentCheck } from '@/middleware/consent.middleware';
import { tierCheck } from '@/middleware/tier.middleware';

const router = Router();

// POST /api/events - Create event (requires auth + consent + tier check)
router.post(
    '/', 
    authenticate,
    consentCheck, 
    tierCheck, 
    ctrl.createEvent
);

// GET /api/events/mine - Get current user's events (requires auth)
router.get('/mine', authenticate, ctrl.getMyEvents);

// POST /api/events/:id/publish - Publish event (requires auth + consent + tier check)
router.post(
    '/:id/publish', 
    authenticate,
    consentCheck, 
    tierCheck, 
    ctrl.publishEvent
);

// PATCH /api/events/:id - Update event (requires auth)
router.patch('/:id', authenticate, ctrl.updateEvent);

// DELETE /api/events/:id - Delete event (requires auth)
router.delete('/:id', authenticate, ctrl.deleteEvent);

// GET /api/events/:id - Get single event (PUBLIC - placed last to avoid pattern matching issues)
router.get('/:id', ctrl.getEventById);
export const eventRouter = router;