import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import eventsData from '../data/events.json'; 

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const getStatusBadge = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    
    const todayReset = new Date(today.setHours(0, 0, 0, 0));
    const eventReset = new Date(event.setHours(0, 0, 0, 0));
    
    const diffTime = eventReset.getTime() - todayReset.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return (
            <span className="badge bg-danger px-3 py-2 shadow-sm d-flex align-items-center gap-2">
                <span className="spinner-grow spinner-grow-sm" role="status"></span>
                LIVE NOW
            </span>
        );
    } else if (diffDays === 1) {
        return <span className="badge bg-warning text-dark px-3 py-2 shadow-sm">STARTS IN 24H</span>;
    }
    return <span className="badge bg-primary px-3 py-2 shadow-sm">{eventDate}</span>;
};

const handleShare = (eventTitle: string) => {
    const shareData = {
        title: eventTitle,
        text: `Check out this event: ${eventTitle}`,
        url: window.location.href,
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    }
};

const getGoogleCalendarUrl = (event: any) => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const details = event.longDescription || event.description;
    return `${base}&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location)}`;
};

export default function GlobalEventPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const categories = ["All", "Workshop", "Conference", "Music", "Coding", "Health"];

    const filteredEvents = eventsData.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLoc = selectedLocation === "All" || event.location.includes(selectedLocation);
        const matchesCat = selectedCategory === "All" || event.category === selectedCategory;
        return matchesSearch && matchesLoc && matchesCat;
    });

    return (
        <div className="min-vh-100 bg-body position-relative overflow-hidden">
            <div
                className="position-absolute top-0 start-0 translate-middle bg-primary opacity-10 rounded-circle"
                style={{ width: "600px", height: "600px", filter: "blur(100px)", zIndex: 0 }}
            ></div>
            <div
                className="position-absolute bottom-0 end-0 bg-info opacity-10 rounded-circle"
                style={{ width: "400px", height: "400px", filter: "blur(80px)", zIndex: 0 }}
            ></div>

            <main className="container py-5 position-relative" style={{ zIndex: 1 }}>
                
                {/* Search Bar */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="row justify-content-center mb-4"
                >
                    <div className="col-lg-8">
                        <div className="p-2 bg-body-tertiary border rounded-pill shadow-lg d-flex align-items-center px-4 backdrop-blur">
                            <select 
                                className="form-select border-0 bg-transparent fw-bold text-primary w-auto shadow-none"
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="All">Global</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="Japan">Japan</option>
                            </select>
                            <div className="vr mx-3 my-2"></div>
                            <input 
                                type="text" 
                                className="form-control border-0 bg-transparent shadow-none" 
                                placeholder="Search by event name..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Category Quick-Pills */}
                <div className="d-flex justify-content-center gap-2 mb-5 overflow-auto pb-2 custom-scrollbar">
                    {categories.map((cat) => (
                        <motion.button
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(cat)}
                            className={`btn rounded-pill px-4 fw-bold transition-all ${
                                selectedCategory === cat 
                                ? 'btn-primary text-white shadow-primary' 
                                : 'btn-outline-primary border-opacity-25'
                            }`}
                            style={selectedCategory === cat ? { boxShadow: '0 0 20px rgba(13, 110, 253, 0.4)' } : {}}
                        >
                            {cat}
                        </motion.button>
                    ))}         
                </div>

                {/* Event Grid */}
                <div className="row g-4">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="col-12 col-md-6 col-lg-4">
                            <motion.div
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ y: -10 }}
                                onClick={() => setSelectedEvent(event)}
                                className="card h-100 border-0 shadow overflow-hidden bg-body-tertiary backdrop-blur cursor-pointer"
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                <div className="position-relative">
                                    <img src={event.image} className="card-img-top" alt={event.title} style={{ height: '220px', objectFit: 'cover' }} />
                                    <div className="position-absolute bottom-0 start-0 m-3">
                                        {getStatusBadge(event.date)}
                                    </div>
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <span className="badge bg-white text-dark shadow-sm">{event.category}</span>
                                    </div>
                                </div>

                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="fw-bold mb-0">{event.title}</h5>
                                        <span className="text-success fw-bold">{event.price}</span>
                                    </div>
                                    <p className="text-muted small mb-3">📍 {event.location}</p>
                                    <p className="card-text text-secondary mb-0 line-clamp-2">
                                        {event.description}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- MODAL SECTION --- */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="modal show d-block p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="modal-content border-0 shadow-lg bg-dark rounded-4"
                                style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <div className="position-relative">
                                    <img src={selectedEvent.image} className="w-100" style={{ height: '240px', objectFit: 'cover' }} alt={selectedEvent.title} />
                                    <button onClick={() => setSelectedEvent(null)} className="btn-close btn-close-white position-absolute top-0 end-0 m-3 p-2 bg-dark bg-opacity-50 rounded-circle" style={{ fontSize: '12px' }}></button>
                                </div>
                                <div className="modal-body p-4 text-white">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex gap-2">
                                            {getStatusBadge(selectedEvent.date)}
                                            <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25 px-2 py-1">{selectedEvent.category}</span>
                                        </div>
                                        <h4 className="text-success fw-bold mb-0">{selectedEvent.price}</h4>
                                    </div>
                                    <h2 className="fw-bold text-white mb-3">{selectedEvent.title}</h2>
                                    
                                    <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <small className="text-primary fw-bold text-uppercase">Venue & Location</small>
                                        <p className="text-white-50 mb-0 small">{selectedEvent.venue} • {selectedEvent.location}</p>
                                    </div>

                                    <div className="d-flex gap-2 mb-4">
                                        <button 
                                            onClick={() => handleShare(selectedEvent.title)}
                                            className="btn btn-outline-light btn-sm rounded-pill px-3 border-opacity-25 flex-fill"
                                        >
                                            Share Event
                                        </button>
                                        <a 
                                            href={getGoogleCalendarUrl(selectedEvent)} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="btn btn-outline-light btn-sm rounded-pill px-3 border-opacity-25 flex-fill text-decoration-none text-center"
                                        >
                                            Add to Calendar
                                        </a>
                                    </div>

                                    <h6 className="text-white fw-bold mb-2">About this event</h6>
                                    <p className="text-secondary small lh-base">{selectedEvent.longDescription}</p>
                                </div>
                                <div className="modal-footer border-0 p-4 bg-dark bg-opacity-50">
                                    <button className="btn btn-link text-decoration-none text-secondary me-auto p-0" onClick={() => setSelectedEvent(null)}>Close</button>
                                    <button className="btn btn-primary px-5 py-2 rounded-pill fw-bold shadow">Book Now</button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );  
}