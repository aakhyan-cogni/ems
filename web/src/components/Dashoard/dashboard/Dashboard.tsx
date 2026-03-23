import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { EventCard } from '../../EventCard'; 
import type { Event } from "../../../../../server/src/types/event.type";
import type { User } from "../../../../../server/src/types/user.type";

export default function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const [isBookedExpanded, setIsBookedExpanded] = useState(true);
    const [isHostedExpanded, setIsHostedExpanded] = useState(true);

    const currentUser: User = { id: "u-1", name: "Alex", email: "alex@example.com" };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/events');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleShare = (eventTitle: string) => {
        if (navigator.share) {
            navigator.share({ title: eventTitle, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Copied link to clipboard!");
        }
    };

    const sortEventsByDate = (a: Event, b: Event) => {
        const now = new Date().getTime();
        const dateA = new Date(a.eventDateTime).getTime();
        const dateB = new Date(b.eventDateTime).getTime();
        const isPastA = dateA < now;
        const isPastB = dateB < now;
        if (!isPastA && isPastB) return -1;
        if (isPastA && !isPastB) return 1;
        return !isPastA && !isPastB ? dateA - dateB : dateB - dateA;
    };

    const bookedEvents = useMemo(() => {
        return events
            .filter(event => event.bookedUserIds?.includes(currentUser.id))
            .sort(sortEventsByDate);
    }, [events, currentUser.id]);

    const hostedEvents = useMemo(() => {
        return events
            .filter(event => event.hostId === currentUser.id)
            .sort(sortEventsByDate);
    }, [events, currentUser.id]);

    if (loading) return <div className="p-5 text-center text-primary">Loading...</div>;

    return (
        <div className="min-vh-100 bg-body text-body transition-all">
            <main className="container py-5">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mb-5 text-center text-md-start"
                >
                    <h1 className="display-5 fw-bold mb-2">
                        My <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="lead text-body-secondary">
                        Welcome back, <span className="text-primary fw-semibold">{currentUser.name}</span>
                    </p>
                </motion.header>

                {/* SECTION: BOOKED EVENTS */}
                <section className="mb-5">
                    <div 
                        className="d-flex align-items-center mb-4" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => setIsBookedExpanded(!isBookedExpanded)}
                    >
                        <div className="bg-primary rounded-circle me-3" style={{ width: '12px', height: '12px' }}></div>
                        <h3 className="mb-0 fw-bold h4">Events You're Attending</h3>
                        <span className="badge bg-primary rounded-pill ms-3">{bookedEvents.length}</span>
                        <motion.span 
                            animate={{ rotate: isBookedExpanded ? 0 : -90 }}
                            className="ms-auto text-secondary"
                        >
                            ▼
                        </motion.span>
                    </div>

                    <AnimatePresence>
                        {isBookedExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="row g-4">
                                    {bookedEvents.length > 0 ? (
                                        bookedEvents.map(event => (
                                            <motion.div layout key={event.id} className="col-12 col-md-6 col-lg-4">
                                                <EventCard event={event} onClick={setSelectedEvent} />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center p-5 rounded-4 bg-body-tertiary border border-secondary border-opacity-10">
                                            <p className="mb-0 text-body-secondary">You haven't booked any events yet.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <hr className="my-5 opacity-10" />

                {/* SECTION: HOSTED EVENTS */}
                <section className="mb-5">
                    <div 
                        className="d-flex align-items-center mb-4" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => setIsHostedExpanded(!isHostedExpanded)}
                    >
                        <div className="bg-info rounded-circle me-3" style={{ width: '12px', height: '12px' }}></div>
                        <h3 className="mb-0 fw-bold h4">Events You're Hosting</h3>
                        <span className="badge bg-info text-dark rounded-pill ms-3">{hostedEvents.length}</span>
                        <motion.span 
                            animate={{ rotate: isHostedExpanded ? 0 : -90 }}
                            className="ms-auto text-secondary"
                        >
                            ▼
                        </motion.span>
                    </div>

                    <AnimatePresence>
                        {isHostedExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="row g-4">
                                    {hostedEvents.length > 0 ? (
                                        hostedEvents.map(event => (
                                            <motion.div layout key={event.id} className="col-12 col-md-6 col-lg-4">
                                                <EventCard event={event} onClick={setSelectedEvent} />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center p-5 rounded-4 bg-body-tertiary border border-secondary border-opacity-10">
                                            <p className="mb-0 text-body-secondary">You aren't hosting any events.</p>
                                            <button className="btn btn-primary rounded-pill mt-3 px-4">Create New Event</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* THEME AWARE MODAL */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="modal show d-block p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95 }} 
                                className="modal-content border-0 bg-body text-body rounded-4 overflow-hidden shadow-lg"
                            >
                                <div className="row g-0">
                                    <div className="col-md-5">
                                        <img src={selectedEvent.image} className="h-100 w-100 object-fit-cover" style={{ minHeight: '350px' }} alt="" />
                                    </div>
                                    <div className="col-md-7">
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <span className="badge bg-primary-subtle text-primary rounded-pill mb-2 px-3">{selectedEvent.category}</span>
                                                    <h2 className="fw-bold mb-0">{selectedEvent.title}</h2>
                                                </div>
                                                <button onClick={() => setSelectedEvent(null)} className="btn-close shadow-none"></button>
                                            </div>

                                            <p className="text-warning small mb-3">⭐ {selectedEvent.avgRating} <span className="text-body-secondary">({selectedEvent.totalRatings} reviews)</span></p>
                                            
                                            <div className="mb-4 p-3 rounded-4 bg-body-tertiary border border-secondary border-opacity-10">
                                                <p className="mb-2 d-flex align-items-center">
                                                    <span className="me-2">📅</span> 
                                                    <span className="fw-semibold">{new Date(selectedEvent.eventDateTime).toLocaleString()}</span>
                                                </p>
                                                <p className="mb-0 d-flex align-items-center text-body-secondary">
                                                    <span className="me-2">📍</span> 
                                                    {selectedEvent.venue || "TBA"} • {selectedEvent.location}
                                                </p>
                                            </div>

                                            <h6 className="fw-bold text-uppercase small text-primary mb-2">About Event</h6>
                                            <p className="text-body-secondary small mb-4" style={{ lineHeight: '1.6' }}>{selectedEvent.longDescription}</p>

                                            <div className="d-flex gap-2">
                                                <button className={`btn btn-primary flex-fill fw-bold rounded-pill ${new Date(selectedEvent.eventDateTime).getTime() < Date.now() ? 'disabled opacity-50' : ''}`}>
                                                    {new Date(selectedEvent.eventDateTime).getTime() < Date.now() 
                                                        ? 'Event Passed' 
                                                        : (selectedEvent.hostId === currentUser.id ? 'Manage Event' : 'Manage Booking')}
                                                </button>
                                                
                                                <button onClick={() => handleShare(selectedEvent.title)} className="btn btn-outline-secondary rounded-pill px-4">
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}