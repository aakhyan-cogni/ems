import { useNavigate } from "react-router";
import TabBar from "../components/TabBar";
import { useLocalDB } from "../store";
import { useEffect } from "react";

const Dashboard = () => {
	const navigate = useNavigate();
	const { user } = useLocalDB();

	useEffect(() => {
		if (user === null) navigate("/login");
	}, []);

	return (
		<div>
			<TabBar />
		</div>
	);
};

export default Dashboard;
