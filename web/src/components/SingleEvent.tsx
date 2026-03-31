import { motion } from "motion/react";
import type { Event } from "../../../server/src/types/event.type";

interface SingleEventProps {
    event: Event;
    onClose: () => void;
}

export default function SingleEvent({ event }: SingleEventProps) {
    const isPastEvent = new Date(event.eventDateTime).getTime() < Date.now();

    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Check out this event: ${event.title}`,
            url: window.location.href, 
        };

        try {
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
            } else {
                
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
           
            if ((err as Error).name !== 'AbortError') {
                console.error("Error sharing:", err);
            }
        }
    };

    return (
        <div className="row g-4 align-items-start">
            {/* Left Side: Image */}
            <div className="col-md-5 col-lg-4">
                <motion.img 
                    layoutId={`event-image-${event.id}`}
                    src={event.image} 
                    className="img-fluid rounded-4 shadow-sm w-100 object-fit-cover" 
                    style={{ maxHeight: '320px', minHeight: '280px' }} 
                    alt={event.title} 
                />
            </div>
            
            {/* Right Side: Content */}
            <div className="col-md-7 col-lg-8">
                <div className="ps-md-2">
                    <span className="badge bg-primary-subtle text-primary rounded-pill mb-2 px-3">
                        {event.category}
                    </span>
                    
                    <h2 className="fw-bold mb-1 text-body">{event.title}</h2>
                    
                    <p className="text-warning small mb-3">
                        ⭐ {event.avgRating || "0.0"} 
                        <span className="text-body-secondary ms-1">({event.totalRatings || 0} reviews)</span>
                    </p>
                    
                    <div className="card border-0 bg-body-tertiary rounded-4 p-3 mb-4" style={{ maxWidth: '450px' }}>
                        <div className="d-flex align-items-center mb-2 small text-body">
                            <span className="me-2 text-primary">📅</span> 
                            <span className="fw-semibold">
                                {new Date(event.eventDateTime).toLocaleString([], { 
                                    dateStyle: 'medium', 
                                    timeStyle: 'short' 
                                })}
                            </span>
                        </div>
                        <div className="d-flex align-items-center small text-body-secondary">
                            <span className="me-2 text-primary">📍</span> 
                            <span>{event.venue || "TBA"} • {event.location}</span>
                        </div>
                    </div>

                    <h6 className="fw-bold text-uppercase small text-primary mb-2">About Event</h6>
                    <p className="text-body-secondary small mb-4 lh-base" style={{ maxWidth: '650px' }}>
                        {event.longDescription || event.description}
                    </p>

                    <div className="d-flex gap-2 pt-2">
                        <button 
                            className={`btn btn-primary px-4 fw-bold rounded-pill shadow-sm ${isPastEvent ? 'disabled opacity-50' : ''}`}
                        >
                            {isPastEvent ? 'Registration Closed' : `Book Ticket (${event.price} ${event.currency})`}
                        </button>
                        
                        <button 
                            onClick={handleShare}
                            className="btn btn-outline-secondary rounded-pill px-4"
                        >
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}