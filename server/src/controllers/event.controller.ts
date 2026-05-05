


// import { Request, Response } from "express";
// import * as EventService from "@/services/event.service";

// export const getEvents = async (req: Request, res: Response) => {
// 	try {
// 		const events = await EventService.getAllEvents();
// 		res.status(200).json(events);
// 	} catch (error) {
// 		res.status(500).json({ message: "Error fetching events" });
// 	}
// };

import { Request, Response } from 'express';
import * as service from '@/services/event.service';
import { ObjectId } from 'mongodb';
import { events, registrations } from '@/lib/mongo';
import type { EventDoc } from '@/models/event.model';

export const createEvent = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        const event = await service.createEvent(req.body, req.user);
        res.status(201).json(event);
    } catch (error) {
        console.error("[createEvent] Error:", error);
        res.status(500).json({ message: "Error creating event" });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const col = await events();
        const event = await col.findOne({ _id: new ObjectId(id) });

        if (!event) return res.status(404).json({ message: "Event not found" });

        // Permission Logic: Admin can do anything. 
        // Organizer can only edit if status is DRAFT or REJECTED.
        const isOrganizer = event.organizerId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'ADMIN';
        
        if (!isAdmin && (!isOrganizer || !["DRAFT", "REJECTED"].includes(event.status))) {
            return res.status(403).json({ message: "Edit not allowed at this stage" });
        }

        await service.updateEvent(id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("[updateEvent] Error:", error);
        res.status(500).json({ message: "Error updating event" });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const col = await events();
        const event = await col.findOne({ _id: new ObjectId(id) });

        if (!event) return res.status(404).json({ message: "Event not found" });

        // Permission check: only organizer or admin
        const isOrganizer = event.organizerId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'ADMIN';
        
        if (!isAdmin && !isOrganizer) {
            return res.status(403).json({ message: "Only organizer or admin can delete" });
        }

        // Check for registrations
        const regCount = await (await registrations()).countDocuments({ eventId: new ObjectId(id) });
        if (regCount > 0) {
            return res.status(409).json({ message: "Cannot delete event with registrations" });
        }

        await service.deleteEvent(id);
    	res.status(203).json({ success: true });
    } catch (err: any) {
        if (err.message === "CONFLICT_HAS_REGISTRATIONS") {
            return res.status(409).json({ message: "Cannot delete event with registrations" });
        }
        console.error("[deleteEvent] Error:", err);
        res.status(500).json({ message: "Error deleting event" });
    }
};

export const publishEvent = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const col = await events();
        const event = await col.findOne({ _id: new ObjectId(id) });

        if (!event) return res.status(404).json({ message: "Event not found" });

        // Permission check: only organizer or admin
        const isOrganizer = event.organizerId.toString() === req.user.userId;
        const isAdmin = req.user.role === 'ADMIN';
        
        if (!isAdmin && !isOrganizer) {
            return res.status(403).json({ message: "Only organizer or admin can publish" });
        }

        await service.publishEvent(id, req.user.userId);
        res.json({ success: true });
    } catch (err: any) {
        console.error("[publishEvent] Error:", err);
        res.status(400).json({ message: err.message });
    }
};

export const getMyEvents = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        
        const list = await service.getMyEvents(req.user.userId);
        res.json(list);
    } catch (error) {
        console.error("[getMyEvents] Error:", error);
        res.status(500).json({ message: "Error fetching events" });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const col = await events();
        const event = await col.findOne({ _id: new ObjectId(id) });

        if (!event) return res.status(404).json({ message: "Event not found" });

        // Visibility rules:
        // - If PRIVATE: only organizer, admin, or registered attendee can view
        // - If status is not APPROVED: only organizer or admin can view
        const userId = req.user?.userId;
        const isAdmin = req.user?.role === 'ADMIN';
        const isOrganizer = event.organizerId.toString() === userId;

        if (event.visibility === "PRIVATE") {
            // Check if user is registered
            let isRegistered = false;
            if (userId) {
                const regCol = await registrations();
                const reg = await regCol.findOne({
                    eventId: new ObjectId(id),
                    userId: new ObjectId(userId),
                    status: "CONFIRMED"
                });
                isRegistered = !!reg;
            }

            if (!isAdmin && !isOrganizer && !isRegistered) {
                return res.status(403).json({ message: "Private event" });
            }
        }

        // If status is not APPROVED, only organizer/admin can view
        if (event.status !== "APPROVED") {
            if (!isAdmin && !isOrganizer) {
                return res.status(403).json({ message: "This event is not yet available" });
            }
        }

        const result = await service.getEventById(id);
        res.json(result);
    } catch (error) {
        console.error("[getEventById] Error:", error);
        res.status(500).json({ message: "Error fetching event" });
    }
};