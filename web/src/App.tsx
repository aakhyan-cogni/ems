import { motion } from "motion/react";

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
};

function App() {
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

			<main className="position-relative" style={{ zIndex: 1 }}>
				<motion.section
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeInUp}
					className="py-5 text-center container-fluid bg-transparent"
				>
					<div className="row py-lg-5 justify-content-center">
						<div className="col-lg-8 col-md-10 px-4">
							<motion.span
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="badge rounded-pill text-bg-primary mb-3 px-3 py-2 shadow-sm"
							>
								🚀 New: AI Event Assistant Available
							</motion.span>
							<h1 className="display-3 fw-bold text-body-emphasis mb-3">
								Manage Events with <span className="text-primary text-gradient">EMS</span>
							</h1>
							<p className="lead text-body-secondary mb-4 mx-auto" style={{ maxWidth: "700px" }}>
								The all-in-one platform for organizers and attendees. Create, discover, and manage
								events with seamless payment and real-time analytics.
							</p>
							<div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
								<motion.button
									whileTap={{ scale: 0.95 }}
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
							</div>
						</div>
					</div>
				</motion.section>

				<div className="container py-5">
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="row g-4 text-center"
					>
						{[
							{ label: "Events Hosted", val: "500+" },
							{ label: "Active Users", val: "10k+" },
							{ label: "Success Rate", val: "99%" },
						].map((stat, i) => (
							<motion.div key={i} variants={fadeInUp} className="col-md-4">
								<div className="p-4 border border-primary border-opacity-10 rounded-4 bg-body-tertiary shadow-sm backdrop-blur">
									<h2 className="fw-bold m-0 text-primary">{stat.val}</h2>
									<p className="text-muted m-0 fw-semibold">{stat.label}</p>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>

				<section className="container py-5">
					{/* Header Section */}
					<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
						<div>
							<h2 className="fw-bold border-start border-primary border-4 ps-3">Upcoming Events</h2>
							<p className="text-muted mb-0">Don't miss out on these top-rated experiences.</p>
						</div>
						<button className="btn btn-link text-decoration-none fw-bold p-0 text-start">View All →</button>
					</div>

					{/* Modern Search Bar */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-5"
					>
						<div className="row">
							<div className="col-lg-8">
								<div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border">
									<span className="input-group-text bg-body border-0 ps-4">
										<i className="bi bi-search text-primary"></i> 🔍
									</span>
									<input
										type="text"
										className="form-control bg-body border-0 py-2 shadow-none"
										placeholder="Search for events, workshops, or conferences..."
										aria-label="Search events"
									/>
									<button className="btn btn-primary px-4 fw-semibold" type="button">
										Search
									</button>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Event Grid */}
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
					>
						{[1, 2, 3].map((item) => (
							<motion.div key={item} variants={fadeInUp} className="col">
								<motion.div
									whileHover={{ y: -10 }}
									className="card h-100 shadow border-0 overflow-hidden bg-body-tertiary backdrop-blur"
								>
									<div className="position-relative">
										<img
											src={`https://picsum.photos/seed/${item + 40}/600/400`}
											className="card-img-top filter-brightness"
											alt="event"
										/>
										<div className="position-absolute top-0 end-0 m-3">
											<span className="badge bg-white text-dark shadow-sm">Workshop</span>
										</div>
									</div>
									<div className="card-body p-4">
										<div className="d-flex justify-content-between align-items-center mb-3">
											<small className="text-primary fw-bold text-uppercase">Mar 15, 2026</small>
											<span className="h5 mb-0 text-success fw-bold">$25.00</span>
										</div>
										<h5 className="card-title fw-bold">Tech Conference 2026</h5>
										<p className="card-text text-muted small">
											Join us for a deep dive into React 19 and the future of web dev.
										</p>
									</div>
									<div className="card-footer bg-transparent border-0 px-4 pb-4">
										<button className="btn btn-primary w-100 rounded-pill py-2 shadow-sm">
											Book Now
										</button>
									</div>
								</motion.div>
							</motion.div>
						))}
					</motion.div>
				</section>
			</main>

			<footer
				className="py-4 border-top bg-body-tertiary text-center text-muted position-relative"
				style={{ zIndex: 1 }}
			>
				<p className="mb-0 fw-medium">&copy; 2026 EMS. Built in Cognizant.</p>
			</footer>
		</div>
	);
}

export default App;
