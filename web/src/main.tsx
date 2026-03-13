import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./style.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import Navbar from "./components/Navbar";
import "bootstrap";
import Dashboard from "./pages/Dashboard";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<Navbar />
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/login" element={<Login />} />
			<Route path="/dashboard" element={<Dashboard/>} />
		</Routes>
	</BrowserRouter>,
);
