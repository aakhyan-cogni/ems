import GradientText from "./components/special/GradientText";
import SplitText from "./components/special/SplitText";
import { motion } from "motion/react";
import Lottie from "lottie-react";
import calendar from "./assets/calendar.json";
import { useNavigate } from "react-router";

export default function App() {

const navigate = useNavigate();

const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};



const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.2 },
	},
}

	return (
		<div className="container position-relative w-100 h-100 d-flex flex-column align-items-center justify-content-center">
			<div className="container d-flex flex-column flex-md-row z-1 p-2" style={{ backdropFilter: "blur(2px)" }}>
				<div className="d-flex flex-column justify-content-center w-50">
					<div className="d-flex flex-column justify-content-start align-items-baseline">
						<div
							className="d-flex justify-content-between w-100"
							style={{
								transform: "translateY(50%)",
							}}
						>
							<h1 className="display-3 fw-bold">
								<GradientText animationSpeed={4}>Event</GradientText>
							</h1>
							<Lottie animationData={calendar} className="w-25" />
							{/* <p className="lead text-body-secondary mb-4 mx-auto" style={{ maxWidth: "700px" }}>
								The all-in-one platform for organizers and attendees. Create, discover, and manage
								events with seamless payment and real-time analytics.
							</p> */}
							{/* <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
								<motion.button
									whileTap={{ scale: 0.95 }}
									onClick={() => navigate("/events")}
									className="btn btn-primary btn-lg px-5 rounded-pill shadow"
								>
									Explore Events
								</motion.button>
								<motion.button
									whileTap={{ scale: 0.95 }}
									style={{ transition: "color 0s" }}
									className="btn btn-outline-primary btn-lg px-5 rounded-pill shadow-sm"
								>
									Create Event
								</motion.button>
							</div> */}
						</div>
						<h1 className="display-3 fw-bold align-self-start">
							<GradientText animationSpeed={4}>Management</GradientText>
						</h1>
					</div>
					<h1 className="fst-italic">Made Simple</h1>
					<small className="py-2">
						<SplitText
							splitType="words"
							textAlign="left"
							duration={2}
							ease="elastic.out(1, 0.9)"
							text="EMS simplifies event planning with end to end management. We take care of every detail from venues to logistics ensuring your event runs smoothly and leaves a lasting impact."
						/>
					</small>
					<motion.button whileTap={{ scale: 0.98 }} className="fs-md-4 btn btn-primary rounded-pill">
						Create your First Event
					</motion.button>
				</div>
			</div>
		</div>
	);
}
