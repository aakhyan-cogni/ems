import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { EventCard } from '../components/EventCard';
import type { Event } from "../../../server/src/types/event.type";

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

export default function GlobalEventPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventData, setEventData] = useState<Event[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/events');
                const data = await response.json();
                setEventData(data);
            } catch (error) { console.error("Failed to fetch events:", error); }
        };
        fetchEvents();
    }, []);

    const categories = ["All", "Workshops", "Conferences", "Social", "Entertainment", "Health & Wellness", "Education"];

    const sortedAndFilteredEvents = useMemo(() => {
        const now = Date.now();
        const filtered = eventData.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLoc = selectedLocation === "All" || event.location.includes(selectedLocation);
            const matchesCat = selectedCategory === "All" || event.category === selectedCategory;
            return matchesSearch && matchesLoc && matchesCat;
        });

        return filtered.sort((a, b) => {
            const timeA = new Date(a.eventDateTime).getTime();
            const timeB = new Date(b.eventDateTime).getTime();
            const isPastA = timeA < now;
            const isPastB = timeB < now;
            if (isPastA && !isPastB) return 1;
            if (!isPastA && isPastB) return -1;
            return !isPastA && !isPastB ? timeA - timeB : timeB - timeA;
        });
    }, [eventData, searchTerm, selectedLocation, selectedCategory]);

    const handleShare = (eventTitle: string) => {
        if (navigator.share) navigator.share({ title: eventTitle, url: window.location.href });
        else { navigator.clipboard.writeText(window.location.href); alert("Copied!"); }
    };

    return (
        <div className="min-vh-100 bg-body position-relative overflow-hidden">
            {/* Background Orbs */}
            <div className="position-absolute top-0 start-0 translate-middle bg-primary opacity-10 rounded-circle" style={{ width: "600px", height: "600px", filter: "blur(100px)", zIndex: 0 }}></div>
            <div className="position-absolute bottom-0 end-0 bg-info opacity-10 rounded-circle" style={{ width: "400px", height: "400px", filter: "blur(80px)", zIndex: 0 }}></div>

            <main className="container py-5 position-relative" style={{ zIndex: 1 }}>
                
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-5">
                    <h1 className="display-4 fw-bold text-body mb-2">
                        Explore <span className="text-primary">Global Events</span>
                    </h1>
                    <p className="lead text-body-secondary mx-auto" style={{ maxWidth: "600px" }}>
                        Discover and book the best experiences happening around you.
                    </p>
                </motion.div>

                {/* Search Bar - Adaptive Colors */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="row justify-content-center mb-4">
                    <div className="col-lg-8">
                        <div className="p-2 bg-body-tertiary border border-primary border-opacity-10 rounded-pill shadow d-flex align-items-center px-4 backdrop-blur">
                            <select 
                                className="form-select border-0 bg-transparent fw-bold text-primary w-auto shadow-none cursor-pointer" 
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                style={{ color: 'var(--bs-primary)' }}
                            >
                                <option value="All">Global</option>
                                <option value="New York">New York</option>
                                <option value="London">London</option>
                            </select>
                            <div className="vr mx-3 my-2 opacity-25"></div>
                            <input 
                                type="text" 
                                className="form-control border-0 bg-transparent shadow-none text-body" 
                                placeholder="Search events..." 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Categories */}
                <div className="d-flex justify-content-center gap-2 mb-5 overflow-auto pb-2 flex-wrap">
                    {categories.map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)} 
                            className={`btn rounded-pill px-4 fw-bold transition-all ${
                                selectedCategory === cat 
                                ? 'btn-primary shadow' 
                                : 'btn-outline-primary border-opacity-25 bg-body-tertiary backdrop-blur'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="row g-4">
                    {sortedAndFilteredEvents.map((event) => (
                        <motion.div key={event.id} layout variants={fadeInUp} className="col-12 col-md-6 col-lg-4">
                            <EventCard event={event} onClick={setSelectedEvent} />
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            {/* Adaptive Modal UI */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="modal show d-block p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.9 }} 
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

                                            <p className="text-warning small mb-3">⭐ {selectedEvent.avgRating} <span className="text-body-secondary text-opacity-75">({selectedEvent.totalRatings} reviews)</span></p>
                                            
                                            <div className="mb-4 p-3 rounded-4 bg-body-tertiary border border-primary border-opacity-10">
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
                                                <button className={`btn btn-primary flex-fill fw-bold rounded-pill shadow ${new Date(selectedEvent.eventDateTime).getTime() < Date.now() ? 'disabled opacity-50' : ''}`}>
                                                    {new Date(selectedEvent.eventDateTime).getTime() < Date.now() ? 'Registration Closed' : `Book Ticket (${selectedEvent.price} ${selectedEvent.currency})`}
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