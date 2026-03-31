import React, { useEffect, useState } from "react";
import OrganizationalInfo from "./OrganizationalInfo";
import { StaticElement } from "three/examples/jsm/transpiler/AST.js";
import { useLocalDB } from "../../../store";


const Address = ({registerSave}) => {
	const [isUpdated, setUpdate] = useState(false);
	const {saveAddress , user:currentUserData} = useLocalDB();
	
	const [country, setCountry] = useState(currentUserData?.personalData?.country);
	const [state, setState] = useState(currentUserData?.personalData?.state);
	const [city, setCity] = useState(currentUserData?.personalData?.city);
	const [zip, setZip] = useState(currentUserData?.personalData?.zipcode);

	useEffect(() => {
	
			const data ={
				country,
				state,
				city,
				zipcode:zip
			};
			registerSave(() => {
			saveAddress(data);
			});
		}, [country, state, city, zip]);
	

	return (
		<div>
			<div className="container-fluid h-auto d-flex flex-column personal-wrapper">
				<div className="flex-shrink-0">
					<div className="d-flex align-items-center w-100 overflow-hidden">
						<div className={`bg-info rounded-circle mx-2`} style={{ width: "10px", height: "10px" }} />
						<h4 className={`mt-1 text-info`}>Address Info</h4>
					</div>
					<hr className={`my-2 border-info border-2 opacity-95`} />
				</div>

				<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
					<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
						<div className="row g-3">
							{/* Country */}
							<div className="col-12 col-lg-6">
								<label className="form-label">
									Country <span className="text-danger">*</span>
								</label>
								<input
									required
									// onKeyUp={() => setUpdate(true)}
									onChange={(e) => {
										setUpdate(true);
										setCountry(e.target.value);
									}}
									value={country}
									type="text"
									className="form-control"
									placeholder="Country"
								/>
							</div>

							{/* State */}
							<div className="col-12 col-lg-6">
								<label className="form-label">
									State <span className="text-danger">*</span>
								</label>
								<input
									required
									// onKeyUp={() => setUpdate(true)}
									onChange={(e) => {
										setUpdate(true);
										setState(e.target.value);
									}}
									value={state}
									type="text"
									className="form-control"
									placeholder="State"
								/>
							</div>

							{/* City */}
							<div className="col-12 col-lg-6">
								<label className="form-label">
									City <span className="text-danger">*</span>
								</label>
								<input
									required
									// onKeyUp={() => setUpdate(true)}
									onChange={(e) => {
										setUpdate(true);
										setCity(e.target.value);
									}}
									value={city}
									type="text"
									className="form-control"
									placeholder="City"
								/>
							</div>

							{/* Zipcode */}
							<div className="col-12 col-lg-6">
								<label className="form-label">
									Zipcode <span className="text-danger">*</span>
								</label>
								<input
									required
									// onKeyUp={() => setUpdate(true)}
									onChange={(e) => {
										setUpdate(true);
										setZip(e.target.value);
									}}
									value={zip}
									type="number"
									className="form-control"
									placeholder="Zipcode"
								/>
							</div>

							{/* Full Address */}
							<div className="col-12">
								<label className="form-label">Address</label>
								<textarea
									rows={3}
									value={
										city && state && country && zip
											? city.trim() + ", " + state.trim() + ", " + country.trim() + " - " + zip.trim()
											: ""
									}
									className="form-control"
									disabled
								/>
							</div>
						</div>
					</form>
				</div>
			</div>
			{/* <OrganizationalInfo /> */}
			<div hidden={!isUpdated} className="col-6 alert alert-warning" role="alert">
				⚠️ Don't forget to save
			</div>
		</div>
	);
};

export default Address;
