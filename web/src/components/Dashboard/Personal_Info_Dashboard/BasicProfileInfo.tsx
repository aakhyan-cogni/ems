import React from "react";
import { useState } from "react";
import Female_1 from "../../../assets/Profile_Avatars/Female_1.jpeg";
import Female_2 from "../../../assets/Profile_Avatars/Female_2.jpeg";
import Female_3 from "../../../assets/Profile_Avatars/Female_3.jpeg";
import Male_1 from "../../../assets/Profile_Avatars/Male_1.jpeg";
import Male_2 from "../../../assets/Profile_Avatars/Male_2.jpeg";
import Male_3 from "../../../assets/Profile_Avatars/Male_3.jpg";
import { AnimatePresence, motion } from "motion/react";
import { useLocalDB } from "../../../store";
import toast from "react-hot-toast";

const BasicProfileInfo = () => {
	// const [section_icon, setSectionIcon] = useState("success");
	// const [section, setSection] = useState("Basic Profile Info");
	const [isUpdated, setUpdate] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const { user, setUser } = useLocalDB();
	const profileImg = user?.avatar ?? "Male_1";
	const images = { Female_1, Female_2, Female_3, Male_1, Male_2, Male_3 };

	const [fname, setFname] = useState("");
	const [lname, setLname] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [dob, setDob] = useState("");
	const [gender, setGender] = useState("");

	function handleProfilePicChange(e: React.MouseEvent<HTMLImageElement>) {
		e.preventDefault();
		const newAvatar = e.currentTarget.id;
		setUser((prevUser) => {
			return {
				...prevUser,
				avatar: newAvatar,
			};
		});
		toast.success(`Avatar updated successfully.`);
		setShowModal(false);
		return;
	}

	const ModalComponent = () => {
		return (
			<div
				className="modal show d-block p-4"
				tabIndex={-1}
				style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", zIndex: 1050 }}
			>
				<div className="modal-dialog modal-dialog-centered modal-lg">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="modal-content border-0 bg-body text-body rounded-4 overflow-hidden shadow-lg"
					>
						<div className="modal-header">
							<h5 className="modal-title">Select your avatar</h5>
							<button
								type="button"
								className="btn-close"
								onClick={() => setShowModal(false)}
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<div className="row g-4 justify-content-center">
								{Object.values(images).map((src, i) => {
									return (
										<div key={i} className="col-4 col-lg-2 text-center">
											<img
												id={Object.keys(images)[i]}
												src={src}
												onClick={handleProfilePicChange}
												className="img-fluid rounded-circle"
												style={{ aspectRatio: "1 / 1", objectFit: "cover", cursor: "pointer" }}
												alt="profile"
											/>
										</div>
									);
								})}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		);
	};

	return (
		<div className="container-fluid h-100 d-flex flex-column personal-wrapper">
			<AnimatePresence>{showModal && <ModalComponent />}</AnimatePresence>
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className={`bg-info rounded-circle mx-2`} style={{ width: "10px", height: "10px" }} />
					<h4 className={`mt-1 text-info`}>Basic Profile Info</h4>
				</div>
				<hr className={`my-2 border-info border-2 opacity-95`} />
			</div>

			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
					<div className="row g-3">
						{/* Profile image upload */}
						<div className="col-12  d-flex flex-column align-items-center justify-content-center">
							<img
								src={images[profileImg as keyof typeof images]}
								alt="Profile Img"
								className="w-25 m-3 rounded-circle"
							/>
							{/* <label className="justify-content-center align-middle"></label> */}
							{/* <input type="file" className="form-control align-content-center justify-content-center align-self-center" id="upload_profile_pic"  accept=".jpeg/.png"/> */}
							<button
								onClick={(e) => {
									e.preventDefault();
									setShowModal(true);
								}}
								className={`w-50 bg-info text-dark border-none form-control rounded-2`}
							>
								Change Avatar
							</button>
						</div>

						{/* First Name */}
						<div className="col-12 col-lg-6">
							<label className="form-label">
								First Name <span className="text-danger">*</span>
							</label>
							<input
								// required
								// onKeyUp={() => setUpdate(true)}
								onChange={(e) => {
									setUpdate(true);
									setFname(e.target.value);
								}}
								value={fname}
								type="text"
								className="form-control"
								placeholder="First Name"
							/>
							{/* <div
                hidden={!isUpdated}
                className="mt-1 bg-danger text-center rounded-2 py-1"
              >
                <span className="text-light fw-bold" style={{ fontSize: 12 }}>
                  don’t forget to save
                </span>
              </div> */}
						</div>

						{/* Last Name */}
						<div className="col-12 col-lg-6">
							<label className="form-label">
								Last Name <span className="text-danger">*</span>
							</label>
							<input
								// required
								// onKeyUp={() => {
								// 	setUpdate(true);
								// }}
								onChange={(e) => {
									setUpdate(true);
									setLname(e.target.value);
								}}
								value={lname}
								type="text"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
								placeholder="Last Name"
							/>
							{/* <div
                hidden={!isUpdated}
                className="mt-1 bg-danger text-center rounded-2 py-1"
              >
                <span className="text-light fw-bold" style={{ fontSize: 12 }}>
                  don’t forget to save
                </span>
              </div> */}
						</div>

						{/* Full Name */}
						<div className="col-12">
							<label className="form-label">Full Name</label>
							<input
								type="text"
								disabled
								className="form-control "
								value={fname.trim() + " " + lname.trim()}
							/>
						</div>

						{/* Email */}
						<div className="col-12 col-lg-6">
							<label className="form-label">
								Email <span className="text-danger">*</span>
							</label>
							<input
								// required
								// onKeyUp={() => {
								// 	setUpdate(true);
								// }}
								onChange={(e) => {
									setUpdate(true);
									setEmail(e.target.value);
								}}
								value={email}
								type="email"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
								placeholder="Last Name"
							/>
							{/* <div
                hidden={!isUpdated}
                className="mt-1 bg-danger text-center rounded-2 py-1"
              >
                <span className="text-light fw-bold" style={{ fontSize: 12 }}>
                  don’t forget to save
                </span>
              </div> */}
						</div>

						{/* Phone Number */}
						<div className="col-12 col-lg-6">
							<label className="form-label">
								Phone Number <span className="text-danger">*</span>
							</label>
							<input
								// required
								// onKeyUp={() => {
								// 	setUpdate(true);
								// }}
								onChange={(e) => {
									setUpdate(true);
									setPhone(e.target.value);
								}}
								value={phone}
								type="tel"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
								placeholder="Last Name"
							/>
							{/* <div
                hidden={isUpdated !== "phone"}
                className="mt-1 bg-danger text-center rounded-2 py-1"
              >
                <span className="text-light fw-bold" style={{ fontSize: 12 }}>
                  don’t forget to save
                </span>
              </div> */}
						</div>

						{/* DOB */}
						<div className="col-12 col-lg-6">
							<label className="form-label">Date of Birth </label>
							<input
								// onKeyUp={() => {
								// 	setUpdate(true);
								// }}
								onChange={(e) => {
									setUpdate(true);
									setDob(e.target.value);
								}}
								value={dob}
								type="date"
								className={`form-control `}
								title={!isUpdated ? "" : "Don't forget to save"}
								placeholder="Last Name"
							/>
							{/* <div
                hidden={!isUpdated}
                className="mt-1 bg-danger text-center rounded-2 py-1"
              >
                <span className="text-light fw-bold" style={{ fontSize: 12 }}>
                  don’t forget to save
                </span>
              </div> */}
						</div>

						{/* Gender */}
						<div className="col-12 col-lg-6">
							<label className="form-label">
								Gender <span className="text-danger">*</span>
							</label>
							{/* <input
                onBlur={() => setUpdate("")}
                onKeyUp={() => {setUpdate("dob");}}
                type="date"
                className={`form-control `}
                title={(isUpdated!== "dob")?"":"Don't forget to save"}
                placeholder="Last Name"
              /> */}
							<select
								name="gender"
								className="form-control"
								// required
								onChange={(e) => {
									setUpdate(true);
									setGender(e.target.value);
								}}
								value={gender}
							>
								<option value="Select">____</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
								<option value="Other">Other</option>
							</select>
							{/* <div
                hidden={isUpdated !== "dob"}
                className="mt-1 bg-danger text-center rounded-2 py-1"
              >
                <span className="text-light fw-bold" style={{ fontSize: 12 }}>
                  don’t forget to save
                </span>
              </div> */}
						</div>
					</div>
				</form>
			</div>

			<div hidden={!isUpdated} className="col-6 alert alert-warning" role="alert">
				⚠️ Don't forget to save
			</div>

			{/* <div className={`${!isUpdated?"col-12":"col-6"} d-flex flex-column align-items-end justify-content-end`}>
				
				<button className={` ${(!isUpdated)?"bg-secondary w-25":"bg-info w-50"} text-dark border-none form-control rounded-2`} >Save & Next</button>
			</div> */}
		</div>
	);
};

export default BasicProfileInfo;
