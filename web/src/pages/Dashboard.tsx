import { useNavigate } from "react-router";
import TabBar from "../components/TabBar";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	useEffect(() => {
		if (!isAuthenticated) navigate("/login");
	}, []);

	return (
		<div>
			<TabBar />
		</div>
	);
};

export default Dashboard;
