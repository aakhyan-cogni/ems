import React, { useState } from "react";
import ThemeSwitch from "./ThemeSwitch";
import BasicProfileInfo from "./Personal_Info_Dashboard/BasicProfileInfo";


export default function ProfileLayout() {
	const [active, setActive] = useState("dashboard");
	const [hover, setHover] = useState("");
	const [isLogoutHovered, setIsLogoutHovered] = useState(false);

	//   const NavButton = ({ id, label, icon }) => (
	//     <button
	//       type="button"
	//       className={`nav-link text-start px-3 py-2 ${active === id ? "active" : ""}`}
	//       onClick={() => setActive(id)}
	//       aria-current={active === id ? "page" : undefined}
	//     >
	//       {icon ? <span className="me-2">{icon}</span> : null}
	//       {label}
	//     </button>
	//   );

	return (
		<div className="container-fluid" style={{ overflow: "hidden", height: "100%", width: "100%" }}>
			<div className="row min-lg-vh-100">
				<aside className={`sidebar col-12 col-md-3 col-lg-2 border-end bg-body-tertiary px-0 `}>
					<div className={`d-flex flex-column h-lg-100`}>
						<div className="p-3 border-bottom">
							<h6 className="mb-0">My Account</h6>
							<small className="text-muted">Navigation</small>
						</div>

						<nav className="nav nav-pills flex-wrap flex-lg-column py-2">
							<div className="nav-item d-flex">
								{/* <NavButton id="dashboard" label="Dashboard" icon={"🗓️"}/> */}
								<button
									className={`btn outline-none decoration m-1 mb-0 ms-2 text-start px-3 pt-2 border-none `}
									onClick={() => setActive("dashboard")}
									aria-current={active === "dashboard" ? "page" : undefined}
									onMouseOver={() => setHover("dashboard")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"🗓️"}</span>
									{"Dashboard"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "dashboard" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`  d-none d-lg-block rouded-2 rounded-start rounded-end ${hover === "dashboard" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "70%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
							<div className="nav-item d-flex">
								{/* <NavButton id="personal" label="Personal Details" icon={"👤"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("personal")}
									onMouseOver={() => setHover("personal")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"👤"}</span>
									{"Personal Details"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "personal" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`d-none d-lg-block ${hover === "personal" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "80%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
							<div className="nav-item d-flex">
								{/* <NavButton id="payment" label="Payment Details" icon={"💰"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("payment")}
									onMouseOver={() => setHover("payment")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"💰"}</span>
									{"Payment Details"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "payment" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`d-none d-lg-block ${hover === "payment" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "80%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
							<div className="nav-item d-flex">
								{/* <NavButton id="settings" label="Settings" icon={"⚙️"}/> */}
								<button
									className={`btn m-1 ms-2 text-start px-3 py-2 border-none`}
									onClick={() => setActive("settings")}
									onMouseOver={() => setHover("settings")}
									onMouseOut={() => setHover("")}
								>
									<span className="me-2">{"💰"}</span>
									{"Settings"}
								</button>
								<div
									className={`rouded-3 rounded-top rounded-bottom ${active === "settings" ? "bg-primary" : ""} my-2`}
									style={{
										marginLeft: "auto",
										width: "5px",
										backgroundColor: "transparent",
										color: "transparent",
									}}
								>
									as
								</div>
							</div>
							<div
								className={`d-none d-lg-block rounded-lg ${hover === "settings" ? "bg-primary" : ""} overflow-hidden ms-3`}
								style={{
									width: "60%",
									height: "2px",
									backgroundColor: "transparent",
									color: "transparent",
								}}
							>
								as
							</div>
						</nav>

						<div className="mt-auto p-3 ">
							<button
								type="button"
								className={`btn w-100 text-warning ${isLogoutHovered ? "btn-warning text-black" : ""}`}
								onMouseOver={() => setIsLogoutHovered(true)}
								onMouseLeave={() => setIsLogoutHovered(false)}
								onClick={() => {}}
							>
								Logout
							</button>
						</div>
					</div>
				</aside>

				<main className="col-12 col-md-9 col-lg-10 p-3">
					<div className="card shadow-sm h-100">
						<div className="card-body">
							{active === "dashboard" && <DashboardContent />}
							{active === "personal" && <PersonalContent />}
							{active === "payment" && <PaymentContent />}
							{active === "settings" && <SettingsContent />}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export function PersonalContent() {

  return (
    <div className="container-fluid h-100 d-flex flex-column personal-wrapper">
      <BasicProfileInfo/>
        <div className="row ">
            
			<div className={`col-12 d-flex flex-column align-items-end justify-content-end `}>
				
				<button className={` bg-info w-25 text-dark border-none form-control rounded-2`} >Save & Next</button>
			</div>
        </div>
      
	
    </div>
	
  )
}

function DashboardContent() {
	return <>Dashboard</>;
}

function PaymentContent() {
	return <>Payment Details</>;
}

function SettingsContent() {
	return <>Settings</>;
}
