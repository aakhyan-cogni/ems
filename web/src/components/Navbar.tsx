import { Link, NavLink } from "react-router";
import ThemeSwitch from "./ThemeSwitch";
import { useLocalDB } from "../store";
import { Avatar } from "./Avatar";

export default function Navbar() {
	const { user } = useLocalDB();
	return (
		<nav className="navbar navbar-expand-lg border-bottom sticky-top bg-body-tertiary flex-nowrap">
			<div className="container gap-md-2">
				<Link className="navbar-brand fw-bold text-primary m-0 mx-md-5" to="/">
					EMS
				</Link>

				<button
					className="navbar-toggler shadow-none border-0"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#emsNav"
					aria-controls="emsNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="emsNav">
					<ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3 text-center">
						{/* <li className="nav-item">
							<NavLink className="nav-link" to="/">
								Home
							</NavLink>
						</li> */}
						<li className="nav-item">
							<NavLink className="nav-link" to="/events">
								Explore Events
							</NavLink>
						</li>
						{user && (
							<li className="nav-item">
								<NavLink className="nav-link" to="/dashboard">
									Dashboard
								</NavLink>
							</li>
						)}
						{user === null && (
							<li className="nav-item">
								<NavLink className="nav-link" to="/pricing">
									Pricing
								</NavLink>
							</li>
						)}
					</ul>
				</div>
			</div>
			<div className="d-flex align-items-center gap-3 me-5">
				<ThemeSwitch />
				{user ? (
					<div style={{ width: "2rem" }}>
						<Avatar user={user} />
					</div>
				) : (
					<Link to="/login" className="btn btn-primary rounded-pill px-4 w-100 w-lg-auto shadow-sm">
						Login
					</Link>
				)}
			</div>
		</nav>
	);
}
