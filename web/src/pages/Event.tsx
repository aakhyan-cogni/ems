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
        window.scrollTo(0, 0);
    }, [eventId]);

    const handleBack = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("q");
        setSearchParams(newParams);
        navigate('/events'); 
    };

    if (!eventId) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 0 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            /* Tight top padding to match your successful layout */
            className="bg-body pt-0 pb-5 d-flex flex-column" 
        >
            <div className="container">
                <div className="py-2"> 
                    <button 
                        onClick={handleBack} 
                        className="btn btn-link text-decoration-none text-primary fw-bold p-0 d-flex align-items-center"
                        style={{ fontSize: '0.85rem', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                       <span className="me-2" style={{ fontSize: '1.5rem' }}>←</span> 
                       Back to All Events
                    </button>
                </div>
                
                <hr className="opacity-10 mt-1 mb-4" /> 

                {loading ? (
                    <div className="text-center p-5 mt-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : event ? (
                    <SingleEvent event={event} onClose={handleBack} />
                ) : (
                    <div className="text-center mt-5 text-muted">Event not found.</div>
                )}
            </div>
        </motion.div>
    );
}