import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { events } from "@/lib";
import { ObjectId, WithId } from "mongodb";
import { UserDoc } from "@/models";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const { users } = await import("@/lib");
const { default: bcrypt } = await import("bcryptjs");

async function seed() {
	const col = await users();

	const existingAdmin = await col.findOne({ role: "ADMIN" });

	if (existingAdmin) {
		console.log("Admin already exists, skipping seed.");
	} else {
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
	}

	const existingUser = await col.findOne({ role: "USER" });

	if (existingUser) {
		console.log("User already exists, skipping seed.");
	}

	const userEmail = process.env.USER_EMAIL;
	const userPassword = process.env.USER_PASSWORD;

	if (!userEmail || !userPassword) {
		console.log("USER_EMAIL and USER_PASSWORD must be set in .env");
		process.exit(1);
	} else if (!existingUser) {
		const userHashPass = (await bcrypt.hash(userPassword, 10)) || "1234";

		await col.insertOne({
			email: userEmail,
			password: userHashPass,
			name: "User",
			avatar: "default.png",
			role: "USER",
			tier: "FREE",
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

		console.log("User created : ", userEmail);
	}

	let user: WithId<UserDoc> | null;
	user = await col.findOne({ email: userEmail });

	const eventsCol = await events();

	const isEventSeeded = await eventsCol.findOne({});

	if (isEventSeeded) {
		console.log("Events already exists !");
		process.exit(0);
	} else {
		await eventsCol.insertOne({
			title: "Seeded Event",
			price: 0,
			currency: "INR",
			location: "DELHI",
			category: "Social",
			imgUrls: [],
			description: "Its a Seeded mock event created by EMS for testing",
			date: new Date(),
			tags: [],
			capacity: 100,
			organizerId: new ObjectId(user?._id),
			organizerEmail: userEmail,
			status: "PENDING",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.log("Event created");
	}

	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
