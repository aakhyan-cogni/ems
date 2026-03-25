import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { useLocalDB, type User } from "../store";
import { useNavigate } from "react-router";

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Login() {
	const [login, setLogin] = useState<boolean>(true);
	const navigate = useNavigate();
	const { users, setUser, addUser } = useLocalDB();

	const toggleMode = () => setLogin(!login);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData.entries()) as unknown as User;

		if (login) {
			const user = users.find((u) => u.email === data.email);
			if (user) {
				if (user.password === data.password) {
					setUser(user);
					toast.success(`Welcome back ${user.name.split(" ")[0]}!`);
					navigate("/dashboard");
				} else toast.error(`Invalid Email or Password!`);
			} else toast.error(`Invalid Email or Password!`);
		} else {
			const possibleUser = users.find((r) => r.email === data.email);
			const fname = data.name.split(" ")[0];

			if (possibleUser) {
				if (possibleUser.password === data.password) {
					setUser(data);
					toast.success(`Welcome back ${fname}!`);
					navigate("/dashboard");
					return;
				}
				toast.error(`A user already exists with this email!`);
				return;
			}
			setUser(data);
			addUser(data);
			toast.success(`Hey ${fname}, Welcome to EMS`);
			navigate("/dashboard");
		}
	};

	return (
		<div className="min-vh-100 bg-body position-relative overflow-hidden d-flex align-items-center justify-content-center">
			{/* Background Glows */}
			<div
				className="position-absolute top-0 start-0 translate-middle bg-primary opacity-10 rounded-circle "
				style={{ width: "600px", height: "600px", filter: "blur(100px)", zIndex: 0 }}
			></div>
			<div
				className="position-absolute bottom-0 end-0 bg-info opacity-10 rounded-circle"
				style={{ width: "400px", height: "400px", filter: "blur(80px)", zIndex: 0 }}
			></div>

			{/* Auth Card */}
			<motion.div
				initial="hidden"
				animate="visible"
				variants={fadeInUp}
				className="container position-relative"
				style={{ zIndex: 1, maxWidth: "450px" }}
			>
				<div className="card shadow-lg border-0 rounded-4 mt-4 bg-body-tertiary backdrop-blur p-4 p-md-5">
					<div className="text-center mb-4">
						<motion.span
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="badge rounded-pill text-bg-primary mb-3 px-3 py-2 shadow-sm"
						>
							EMS Secure Portal
						</motion.span>
						<h2 className="fw-bold text-body-emphasis">{login ? "Welcome Back" : "Join EMS"}</h2>
						<p className="text-muted small">
							{login
								? "Enter your credentials to manage your events."
								: "Create an account to start hosting experiences."}
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<AnimatePresence mode="popLayout">
							{!login && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="mb-3"
								>
									<label className="form-label fw-semibold small">Full Name</label>
									<input
										name="name"
										type="text"
										className="form-control rounded-pill border-primary border-opacity-25"
										placeholder="Desired User Name"
										required={!login}
									/>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="mb-3">
							<label className="form-label fw-semibold small">Email Address</label>
							<input
								name="email"
								type="email"
								className="form-control rounded-pill border-primary border-opacity-25"
								placeholder="name@example.com"
								required
							/>
						</div>

						<div className="mb-4">
							<label className="form-label fw-semibold small">Password</label>
							<input
								name="password"
								type="password"
								className="form-control rounded-pill border-primary border-opacity-25"
								placeholder="••••••••"
								required
							/>
						</div>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type="submit"
							className="btn btn-primary w-100 btn-lg rounded-pill shadow mb-3"
						>
							{login ? "Sign In" : "Register Now"}
						</motion.button>

						<motion.button
							type="button"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="btn btn-outline-secondary w-100 btn-lg rounded-pill shadow-sm d-flex align-items-center justify-content-center bg-white border-opacity-25"
							onClick={() => toast("Google Login Triggered")}
						>
							<img
								src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
								alt="Google logo"
								style={{ width: "20px", marginRight: "10px" }}
							/>
							<span className="text-dark small fw-bold">Continue with Google</span>
						</motion.button>
					</form>

					<div className="text-center mt-3">
						<p className="text-muted small mb-1">
							{login ? "Don't have an account?" : "Already have an account?"}
						</p>
						<button
							onClick={toggleMode}
							className="btn btn-link text-primary fw-bold text-decoration-none p-0"
						>
							{login ? "Create Account →" : "← Back to Login"}
						</button>
					</div>
				</div>

				{/* Footer attribution matching App.tsx */}
				<footer className="mt-4 text-center text-muted small opacity-50">
					&copy; 2026 EMS. Built in Cognizant.
				</footer>
			</motion.div>
		</div>
	);
}
