import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import type { Event } from "../../../server/src/types/event.type";
import SingleEvent from "../components/SingleEvent";

export default function Events() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    const eventId = searchParams.get("q");

    useEffect(() => {
        const loadEvent = async () => {
            if (!eventId) return;
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/events');
                const data: Event[] = await response.json();
                const found = data.find((e) => String(e.id) === String(eventId));
                setEvent(found || null);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
        // Ensure page starts at the top when viewing an event
        window.scrollTo(0, 0);
    }, [eventId]);

    const handleBack = () => {
        // Explicitly clear the 'q' parameter to return to the list view
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("q");
        setSearchParams(newParams);
        // Fallback if search params aren't driving the view logic in App.tsx
        navigate('/events');
    };

    if (!eventId) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-vh-100 bg-body py-4"
        >
            <div className="container">
                {/* Positioned at the very top of the container */}
                <button 
                    onClick={handleBack} 
                    className="btn btn-link text-decoration-none text-primary fw-bold p-0 mb-4 d-flex align-items-center"
                >
                   <span className="me-2" style={{ fontSize: '1.2rem' }}>←</span> 
                   Back to All Events
                </button>
                
                {loading ? (
                    <div className="text-center p-5 mt-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : event ? (
                    <SingleEvent event={event} onClose={handleBack} />
                ) : (
                    <div className="text-center mt-5">Event not found.</div>
                )}
            </div>
        </motion.div>
    );
}