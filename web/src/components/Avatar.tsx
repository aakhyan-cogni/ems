import Male_1 from "../assets/Profile_Avatars/Male_1.jpeg";
import Male_2 from "../assets/Profile_Avatars/Male_2.jpeg";
import Male_3 from "../assets/Profile_Avatars/Male_3.jpg";
import Female_1 from "../assets/Profile_Avatars/Female_1.jpeg";
import Female_2 from "../assets/Profile_Avatars/Female_2.jpeg";
import Female_3 from "../assets/Profile_Avatars/Female_3.jpeg";
import type { User } from "../store";

export function Avatar({ user }: AvatarProps) {
	const images = { Male_1, Male_2, Male_3, Female_1, Female_2, Female_3 };
	const imgUrl = images[(user.avatar ?? "Male_1") as keyof typeof images];

	return (
		<img
			src={imgUrl}
			className="img-fluid rounded-circle"
			style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
			alt="profile"
		/>
	);
}

interface AvatarProps {
	user: User;
}
