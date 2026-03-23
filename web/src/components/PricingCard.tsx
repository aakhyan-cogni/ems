export function PricingCard(props: PricingCardProps) {
	let { description, features, price, title, active, popular } = props;

	return (
		<div className={`card h-100 shadow-sm ${active ? "border-primary border-2" : ""}`}>
			{popular && <div className="card-header bg-primary text-white text-center py-1">Most Popular</div>}
			<div className="card-body d-flex flex-column">
				<h3 className="card-title text-center mb-3">{title}</h3>
				<h2 className="text-center mb-3">
					{price}
					<span className="text-muted fs-6">/month</span>
				</h2>
				<p className="card-text text-muted text-center">{description}</p>

				<ul className="list-unstyled my-4 flex-grow-1">
					{features.map((feature, index) => (
						<li key={index} className="mb-2">
							<i className="bi bi-check2 text-success me-2"></i> {feature}
						</li>
					))}
				</ul>

				<button className={`btn w-100 ${active ? "btn-primary" : "btn-outline-primary"}`}>Get Started</button>
			</div>
		</div>
	);
}

export interface PricingCardProps {
	active?: boolean;
	title: string;
	description: string;
	features: string[];
	price: string;
	popular?: boolean;
}
