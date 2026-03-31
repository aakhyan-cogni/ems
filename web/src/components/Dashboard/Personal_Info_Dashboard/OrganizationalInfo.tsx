import React, { useEffect, useState } from "react";
import { useLocalDB } from "../../../store";


interface OrganizationalInfoProps {
  registerSave: (callback: () => void) => void;
}

const OrganizationalInfo: React.FC<OrganizationalInfoProps> = ({registerSave}) => {
	const [isUpdated, setUpdate] = useState(false);
	const {saveOrganizationalInfo , user:currentUserData} = useLocalDB();

	const [org, setOrg] = useState(currentUserData?.personalData?.orgName|| "");
	const [role, setRole] = useState(currentUserData?.personalData?.role|| "");
    const [website, setWebsite] = useState(currentUserData?.personalData?.companyWebsite|| "");
	const [bio, setBio] = useState(currentUserData?.personalData?.bio|| "");

	useEffect(() => {
		
				const data ={
					orgName:org,
					role,
					companyWebsite:website,
					bio
				};
				registerSave(() => {
				saveOrganizationalInfo(data);
				});
			}, [org,role,website,bio]);


	return (
		<div className="container-fluid h-auto d-flex flex-column personal-wrapper">
			<div className="flex-shrink-0">
				<div className="d-flex align-items-center w-100 overflow-hidden">
					<div className={`bg-info rounded-circle mx-2`} style={{ width: "10px", height: "10px" }} />
					<h4 className={`mt-1 text-info`}>Organizational Info</h4>
				</div>
				<hr className={`my-2 border-info border-2 opacity-95`} />
			</div>
			<div className="flex-grow-1 overflow-y-auto overflow-x-hidden content-pane">
				<form className="px-3 pb-3" onSubmit={(e) => e.preventDefault()}>
					<div className="row g-3">

                        {/* Organization name */}
						<div className="col-12 col-lg-6">
							<label className="form-label">Organization Name</label>
							<input
								// onKeyUp={() => setUpdate(true)}
                                onChange={(e) => {
										setUpdate(true);
										setOrg(e.target.value);
									}}
								value={org}
								type="text"
								className="form-control"
								placeholder="Organization name"
							/>
						</div>

                        {/* Role */}
						<div className="col-12 col-lg-6">
							<label className="form-label">Role / designation</label>
							<input
								// onKeyUp={() => setUpdate(true)}
                                onChange={(e) => {
										setUpdate(true);
										setRole(e.target.value);
									}}
								value={role}
								type="text"
								className="form-control"
								placeholder="Role"
							/>
						</div>

                        {/* Company Website */}
						<div className="col-12 col-lg-6">
							<label className="form-label">Company Website</label>
							<input
								// onKeyUp={() => setUpdate(true)}
                                onChange={(e) => {
										setUpdate(true);
										setWebsite(e.target.value);
									}}
								value={website}
								type="url"
								className="form-control"
								placeholder="Company website"
							/>
						</div>

                        {/* Bio */}
						<div className="col-12 col-lg-6">
							<label className="form-label">Bio / description</label>
							<textarea
								rows={3}
								// onKeyUp={() => setUpdate(true)}
                                onChange={(e) => {
										setUpdate(true);
										setBio(e.target.value);
									}}
								value={bio}
								className="form-control"
								placeholder="Bio"
							/>
						</div>
					</div>
				</form>
			</div>
			<div hidden={!isUpdated} className="col-6 alert alert-warning" role="alert">
				⚠️ Don't forget to save
			</div>
		</div>
	);
};

export default OrganizationalInfo;
