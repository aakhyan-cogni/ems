import app from "./app.js";
import { PORT } from "./config/constants";

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
