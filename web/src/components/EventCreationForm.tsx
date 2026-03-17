import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EventCreationForm = () => {
  const [step, setStep] = useState(1);
  const [isFree, setIsFree] = useState(true);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Event Published!");
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* Progress Header */}
          <div className="text-center mb-5">
            <h2 className="fw-bold display-5">
              Create New <span className="text-primary text-gradient">Event</span>
            </h2>
            <p className="text-muted">Fill in the details to launch your experience.</p>

            <div className="d-flex justify-content-between mt-4 position-relative px-5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all ${
                    step >= s ? "btn-primary text-white" : "btn-light border text-muted"
                  }`}
                  style={{ width: "40px", height: "40px", zIndex: 2 }}
                >
                  {s}
                </div>
              ))}
              <div
                className="progress position-absolute top-50 start-0 translate-middle-y w-100"
                style={{ height: "2px", zIndex: 1 }}
              >
                <div
                  className="progress-bar bg-primary transition-all"
                  style={{ width: `${(step - 1) * 50}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="card border-0 shadow-lg p-4 p-md-5 backdrop-blur rounded-4"
          >
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h4 className="fw-bold mb-4">Step 1: Event Basics</h4>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Event Title</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3 shadow-sm border-light-subtle"
                        placeholder="e.g. Tech Conference 2026"
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Category</label>
                        <select className="form-select form-control-lg rounded-3 shadow-sm">
                          <option>Workshop</option>
                          <option>Concert</option>
                          <option>Tech Talk</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Media Upload</label>
                        <input type="file" className="form-control form-control-lg rounded-3 shadow-sm" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control rounded-3 shadow-sm"
                        rows={4}
                        placeholder="Describe your event..."
                      ></textarea>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Logistics */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h4 className="fw-bold mb-4">Step 2: Logistics & Features</h4>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Date</label>
                        <input type="date" className="form-control form-control-lg rounded-3 shadow-sm" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Location</label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-3 shadow-sm"
                          placeholder="Venue or Link"
                        />
                      </div>
                    </div>
                    <hr className="my-4 opacity-10" />
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="waitingRoom" />
                      <label className="form-check-label fw-bold" htmlFor="waitingRoom">
                        Enable Mega-Event Virtual Waiting Room{" "}
                        <span className="badge bg-info-subtle text-info ms-2">USP</span>
                      </label>
                      <div className="form-text text-muted">
                        Activates real-time queuing for high-traffic ticket sales.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Ticketing & Pricing */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h4 className="fw-bold mb-4">Step 3: Ticketing & Squad Pay</h4>

                    <div className="mb-4">
                      <label className="form-label fw-semibold d-block">Is this a free event?</label>
                      <div className="btn-group w-100 shadow-sm" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="eventPricing"
                          id="free"
                          checked={isFree}
                          onChange={() => setIsFree(true)}
                        />
                        <label className="btn btn-outline-primary py-2 fw-bold" htmlFor="free">
                          Free Event
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="eventPricing"
                          id="paid"
                          checked={!isFree}
                          onChange={() => setIsFree(false)}
                        />
                        <label className="btn btn-outline-primary py-2 fw-bold" htmlFor="paid">
                          Paid Event
                        </label>
                      </div>
                    </div>

                    <div className="row mb-4">
                      <AnimatePresence>
                        {!isFree && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="col-md-6 mb-3 overflow-hidden"
                          >
                            <label className="form-label fw-semibold">Ticket Price ($)</label>
                            <div className="input-group">
                              <span className="input-group-text bg-white border-end-0">$</span>
                              <input
                                type="number"
                                className="form-control form-control-lg rounded-end-3 border-start-0 shadow-sm"
                                placeholder="0.00"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className={isFree ? "col-md-12" : "col-md-6"}>
                        <label className="form-label fw-semibold">Total Capacity</label>
                        <input
                          type="number"
                          className="form-control form-control-lg rounded-3 shadow-sm"
                          placeholder="e.g. 500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10 mb-4">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="squadPay" defaultChecked />
                        <label className="form-check-label fw-bold" htmlFor="squadPay">
                          Enable Squad Booking & Split Pay{" "}
                          <span className="badge bg-primary ms-2">USP</span>
                        </label>
                        <p className="small text-muted mb-0">Allow friends to split bills automatically.</p>
                      </div>
                    </div>

                    {/* Limit Counter Box */}
                    <div className="p-3 border border-warning border-opacity-25 bg-warning bg-opacity-10 rounded-4 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="fw-bold text-dark">Organizer Plan</span>
                        <p className="small text-muted mb-0">You have used 3 out of 5 free slots.</p>
                      </div>
                      <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                        3 / 5 Used
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none fw-bold ${step === 1 ? "invisible" : "text-muted"}`}
                  onClick={prevStep}
                >
                  ← Back
                </button>
                {step < 3 ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="btn btn-primary px-5 rounded-pill shadow fw-bold"
                    onClick={nextStep}
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn btn-success px-5 rounded-pill shadow fw-bold"
                  >
                    Publish Event
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventCreationForm;