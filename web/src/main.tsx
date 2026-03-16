import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./style.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import GlobalEventPage from "./pages/Global_Event";
import Navbar from "./components/Navbar";
import "bootstrap";
import Footer from "./components/Footer";
import Antigravity from "./components/special/Antigravity";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<main className="min-vh-100 min-vw-100 d-flex flex-column justify-content-between">
			<Antigravity
				count={200}
				magnetRadius={6}
				ringRadius={10}
				waveSpeed={0.4}
				waveAmplitude={1}
				particleSize={1.5}
				lerpSpeed={0.05}
				color="#9219fd"
				autoAnimate
				particleVariance={1}
				rotationSpeed={0}
				depthFactor={1}
				pulseSpeed={3}
				particleShape="capsule"
				fieldStrength={10}
			/>
			<Navbar />
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/login" element={<Login />} />
				<Route path="/events" element={<GlobalEventPage />} />
			</Routes>
			<Footer />
		</main>
	</BrowserRouter>,
);
