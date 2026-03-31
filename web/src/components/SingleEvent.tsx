import { motion } from "motion/react";
import type { Event } from "../../../server/src/types/event.type";

interface SingleEventProps {
    event: Event;
    onClose: () => void;
}

export default function SingleEvent({ event, onClose }: SingleEventProps) {
    const handleShare = (eventTitle: string) => {
        if (navigator.share) {
            navigator.share({ title: eventTitle, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const isPastEvent = new Date(event.eventDateTime).getTime() < Date.now();

    return (
        <div className="row g-4 align-items-start">
            {/* Smaller Image Column */}
            <div className="col-md-5 col-lg-4">
                <motion.img 
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    src={event.image} 
                    className="img-fluid rounded-4 shadow-sm w-100 object-fit-cover" 
                    style={{ maxHeight: '350px' }} 
                    alt={event.title} 
                />
            </div>
            
            {/* Smaller Text/Content Column */}
            <div className="col-md-7 col-lg-8">
                <div className="ps-md-2">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <span className="badge bg-primary-subtle text-primary rounded-pill mb-2 px-3">
                                {event.category}
                            </span>
                            <h2 className="fw-bold mb-1 text-body">{event.title}</h2>
                        </div>
                        <button onClick={onClose} className="btn-close shadow-none d-lg-none"></button>
                    </div>

                    <p className="text-warning small mb-3">
                        ⭐ {event.avgRating} 
                        <span className="text-body-secondary ms-1">({event.totalRatings} reviews)</span>
                    </p>
                    
                    {/* Compact Info Box */}
                    <div className="card border-0 bg-body-tertiary rounded-4 p-3 mb-4" style={{ maxWidth: '450px' }}>
                        <div className="d-flex align-items-center mb-2 small text-body">
                            <span className="me-2">📅</span> 
                            <span className="fw-semibold">
                                {new Date(event.eventDateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                            </span>
                        </div>
                        <div className="d-flex align-items-center small text-body-secondary">
                            <span className="me-2">📍</span> 
                            <span>{event.venue || "TBA"} • {event.location}</span>
                        </div>
                    </div>

                    <h6 className="fw-bold text-uppercase small text-primary mb-2">About Event</h6>
                    <p className="text-body-secondary small mb-4 lh-base" style={{ maxWidth: '700px' }}>
                        {event.longDescription || event.description}
                    </p>

                    <div className="d-flex gap-2">
                        <button 
                            className={`btn btn-primary px-4 fw-bold rounded-pill shadow-sm flex-grow-0 ${isPastEvent ? 'disabled opacity-50' : ''}`}
                        >
                            {isPastEvent ? 'Registration Closed' : `Book Ticket (${event.price} ${event.currency})`}
                        </button>
                        <button 
                            onClick={() => handleShare(event.title)} 
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