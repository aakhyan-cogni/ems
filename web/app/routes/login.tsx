import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
	return [
		{
			title: "Login",
		},
		{
			name: "description",
			content: "Login to EMS",
		},
	];
}

export default function Login() {
	return <div>Login Here</div>;
}
