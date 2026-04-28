import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

// Dynamic import — only evaluated AFTER config() has run
const { users } = await import("./lib/mongo.js");
const { default: bcrypt } = await import("bcryptjs");

async function seed() {
	const col = await users();

	const existingAdmin = await col.findOne({ role: "ADMIN" });
	if (existingAdmin) {
		console.log("Admin already exists, skipping seed.");
		process.exit(0);
	}

	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;

	if (!email || !password) {
		console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
		process.exit(1);
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	await col.insertOne({
		email,
		password: hashedPassword,
		name: "Admin",
		avatar: "default.png",
		role: "ADMIN",
		tier: "ULTIMATE",
		consentAccepted: true,
		consentAcceptedAt: new Date(),
		consentVersion: null,
		refreshToken: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		phoneNumber: null,
		dob: null,
		gender: null,
		country: null,
		city: null,
		state: null,
		zipcode: null,
		orgName: null,
		designation: null,
		companyWebsite: null,
		bio: null,
	});

	console.log(`Admin user created: ${email}`);
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
