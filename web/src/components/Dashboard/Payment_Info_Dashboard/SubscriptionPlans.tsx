import React from "react";
import PlanCard from "./PlanCard";

const SubscriptionPlans = () => {
	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			{/* Header */}
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className="bg-info rounded-circle mx-2" style={{ width: 10, height: 10 }} />
					<h4 className="mt-1 text-info">Subscription & Plans</h4>
				</div>
				<hr className="my-2 border-info border-2 opacity-95" />
			</div>

			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
					<div className="row g-3">
						{/* Methods */}
						<div className="col-12 col-lg-4">
                            <PlanCard title="Free"/>
                        </div>

                        <div className="col-12 col-lg-4">
                            <PlanCard active={true} title="Pro"/>
                        </div>

                        <div className="col-12 col-lg-4">
                            <PlanCard title="Super"/>
                        </div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SubscriptionPlans;
