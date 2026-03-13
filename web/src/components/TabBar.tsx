import React, { useState } from "react";
import ThemeSwitch from "./ThemeSwitch";

export default function ProfileLayout() {
  const [active, setActive] = useState("dashboard");
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
    <div className="container-fluid">
      <div className="row min-lg-vh-100">
        <aside className={`col-12 col-md-3 col-lg-2 border-end bg-body-tertiary px-0 `}>
          <div className={`d-flex flex-column h-lg-100`}>
            <div className="p-3 border-bottom">
              <h6 className="mb-0">My Account</h6>
              <small className="text-muted">Navigation</small>
            </div>

            <nav className="nav nav-pills flex-wrap flex-lg-column py-2">
              <div className="nav-item">
                {/* <NavButton id="dashboard" label="Dashboard" icon={"🗓️"}/> */}
                <button
                    className={`btn m-1 ms-2 text-start px-3 py-2 ${active === "dashboard" ? "btn-primary" : ""}`}
                    onClick={() => setActive("dashboard")}
                    aria-current={active === "dashboard" ? "page" : undefined}
                    >
                        <span className="me-2">{"🗓️"}</span> 
                    {"Dashboard"}
                </button>
              </div>
              <div className="nav-item">
                {/* <NavButton id="personal" label="Personal Details" icon={"👤"}/> */}
                <button
                    className={`btn m-1 ms-2 text-start px-3 py-2 ${active === "personal" ? "btn-primary" : ""}`}
                    onClick={() => setActive("personal")}>
                        <span className="me-2">{"👤"}</span> 
                    {"Personal Details"}
                </button>
              </div>
              <div className="nav-item">
                {/* <NavButton id="payment" label="Payment Details" icon={"💰"}/> */}
                <button
                    className={`btn m-1 ms-2 text-start px-3 py-2 ${active === "payment" ? "btn-primary" : ""}`}
                    onClick={() => setActive("payment")}>
                        <span className="me-2">{"💰"}</span> 
                    {"Payment Details"}
                </button>
              </div>
              <div className="nav-item">
                {/* <NavButton id="settings" label="Settings" icon={"⚙️"}/> */}
                <button
                    className={`btn m-1 ms-2 text-start px-3 py-2 ${active === "settings" ? "btn-primary" : ""}`}
                    onClick={() => setActive("settings")}>
                        <span className="me-2">{"💰"}</span> 
                    {"Settings"}
                </button>
              </div>
            </nav>

            <div className="mt-auto p-3">
              <button
                type="button"
                className={`btn w-100 text-warning ${isLogoutHovered ? "btn-warning text-black" : ""}`}
                onMouseOver={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
                onClick={() => {

                }}
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

function DashboardContent() {
  return (
    <>DashBoard</>
  );
}

function PersonalContent() {
  return (
    <>Personal Details</>
  );
}

function PaymentContent() {
  return (
    <>Payment Details</>
  );
}

function SettingsContent() {
  return (
    <>Settings</>
  );
}