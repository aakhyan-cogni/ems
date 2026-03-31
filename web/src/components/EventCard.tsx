import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Event } from "../../../server/src/types/event.type";

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function EventCard({ event, onClick }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const eventTime = new Date(event.eventDateTime).getTime();
  const isPast = eventTime < Date.now();

  useEffect(() => {
    if (isPast) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = eventTime - now;
      if (diff <= 0) {
        setTimeLeft("LIVE");
      } else if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${hours}h ${mins}m`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [eventTime, isPast]);

  const getStatusBadge = () => {
    const now = Date.now();
    const diff = eventTime - now;

    if (isPast) {
      return <span className="badge bg-secondary px-3 py-2 opacity-75">Past Event</span>;
    }

    if (diff < 1800000 && diff > -3600000) {
      return (
        <span className="badge bg-danger px-3 py-2 d-flex align-items-center gap-2 shadow-sm">
          <span className="spinner-grow spinner-grow-sm" role="status"></span>
          LIVE NOW
        </span>
      );
    }

    if (diff < 86400000) {
      return (
        <span className="badge bg-warning text-dark px-3 py-2 shadow-sm">
          Starts in {timeLeft || "24h"}
        </span>
      );
    }

    return (
      <span className="badge bg-primary px-3 py-2 shadow-sm">
        {new Date(event.eventDateTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    );
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={!isPast ? { y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" } : {}}
      onClick={() => onClick(event)}
      className={`card h-100 border-0 overflow-hidden ${isPast ? "opacity-60 grayscale" : ""}`}
      style={{
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: "pointer",
        background: "#1e293b",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="position-relative">
        <img
          src={event.image}
          className="card-img-top"
          alt={event.title}
          style={{ height: "200px", objectFit: "cover" }}
        />
        <div className="position-absolute bottom-0 start-0 m-3">
          {getStatusBadge()}
        </div>
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-dark bg-opacity-75 text-white border border-secondary shadow-sm">
            {event.category}
          </span>
        </div>
      </div>

      <div className="card-body p-4 text-white">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5
            className={`fw-bold mb-0 text-truncate text-white ${isPast ? "opacity-50" : ""}`}
            style={{ maxWidth: "70%" }}
          >
            {event.title}
          </h5>
          <span className="text-success fw-bold">
            {event.price === 0 ? "FREE" : `${event.price} ${event.currency}`}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 mb-2">
          <p className="text-white-50 small mb-0">📍 {event.location}</p>
          {event.avgRating && (
            <span className="ms-auto small fw-bold text-warning">
              ⭐ {event.avgRating}
            </span>
          )}
        </div>

        <p className="card-text text-white-50 mb-3 line-clamp-2 small" style={{ opacity: 0.9 }}>
          {event.description}
        </p>

        <div className="d-flex flex-wrap gap-1 mb-3">
          {event.tags?.split(",").slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 small fw-normal"
            >
              {tag.trim()}
            </span>
          ))}
        </div>

        <div className="pt-3 border-top border-white border-opacity-10 d-flex justify-content-between align-items-center">
          <small
            className={isPast ? "text-white-50" : ""}
            style={{ color: isPast ? "" : "#7dd3fc" }}
          >
            {isPast ? `✅ ${event.attendees || 0} Attended` : `👤 ${event.attendees || 0} Attending`}
          </small>
          <small className="fw-bold" style={{ color: "#60a5fa" }}>
            {isPast ? "View Highlights →" : "View Details →"}
          </small>
        </div>
      </div>
    </motion.div>
  );
}