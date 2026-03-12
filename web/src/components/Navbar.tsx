import { Link, NavLink } from "react-router";
import ThemeSwitch from "./ThemeSwitch";

export default function Navbar() {
	return (
		<nav className="navbar navbar-expand-lg border-bottom sticky-top bg-body-tertiary">
			<div className="container gap-md-5">
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
						<li className="nav-item">
							<NavLink className="nav-link" to="/">
								Home
							</NavLink>
						</li>
						<li className="nav-item">
							<NavLink className="nav-link" to="/events">
								Events
							</NavLink>
						</li>
					</ul>

					<div className="d-flex flex-column flex-lg-row align-items-center gap-3 mt-3 mt-lg-0">
						<ThemeSwitch />
						<Link to="/login" className="btn btn-primary rounded-pill px-4 w-100 w-lg-auto shadow-sm">
							Login
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
