import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./style.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import GlobalEventPage from "./pages/Global_Event";
import Navbar from "./components/Navbar";
import "bootstrap";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<Navbar />
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/login" element={<Login />} />
			<Route path="/events" element={<GlobalEventPage/>} />
		</Routes>
	</BrowserRouter>,
);
