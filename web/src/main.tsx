import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./style.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
// import * as bootstrap from 'bootstrap';

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/login" element={<Login />} />
		</Routes>
	</BrowserRouter>,
);
