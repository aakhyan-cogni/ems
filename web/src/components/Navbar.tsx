import { Link, NavLink, useNavigate } from "react-router";
import ThemeSwitch from "./ThemeSwitch";
import { useLocalDB } from "../store";
import { Avatar } from "./Avatar";
import { Popover, OverlayTrigger } from "react-bootstrap";

export default function Navbar() {
	const user = useLocalDB((s) => s.user);
	const setUser = useLocalDB((s) => s.setUser);
	const navigate = useNavigate();

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
					<div style={{ width: "2rem", cursor: "pointer" }}>
						<OverlayTrigger
							trigger="click"
							placement="bottom"
							rootClose
							overlay={
								<Popover id="user-popover" className="shadow border-0">
									<Popover.Header as="h3" className="text-white border-0">
										Hi, {user.name.split(" ")[0]}!
									</Popover.Header>
									<Popover.Body className="p-0">
										<div className="list-group list-group-flush">
											<Link
												to="/dashboard"
												className="list-group-item list-group-item-action border-0"
											>
												My Dashboard
											</Link>
											<button
												onClick={() => {
													setUser(null);
													navigate("/");
												}}
												className="list-group-item list-group-item-action text-danger border-0"
											>
												Logout
											</button>
										</div>
									</Popover.Body>
								</Popover>
							}
						>
							<div>
								<Avatar user={user} />
							</div>
						</OverlayTrigger>
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
