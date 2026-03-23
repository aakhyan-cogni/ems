import React from "react";

type props = {
	active?: boolean;
	title: string;
};

const PlanCard: React.FC<props> = ({ active, title }) => {
	return (
		<div className={`m-2 p-2 rounded-5 ${active ? "border border-2 border-primary" : "text-center"}`}>
			<div
				className={`${active ? "bg-primary d-flex justify-content-around" : "bg-info text-black "} m-1 rounded-start-5 rounded-end-5 fw-bold py-2 `}
			>
				<div className={`${(active)?"justify-content-start":""}align-middle `}>{title}</div>
				{ active &&
                    <div className="justify-content-end fw-semibold rounded-start-5 rounded-end-5 bg-secondary px-3 py-1">active</div>
                }
			</div>
            <div className=" align"></div>
		</div>
	);
};

export default PlanCard;
