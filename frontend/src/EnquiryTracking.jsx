
import { useState } from "react";
import "./EnquiryTracking.css";

const API = `${
  import.meta.env.VITE_API_URL || "http://localhost:8080"
}/api`;

function EnquiryTracking() {
  const [trackingId, setTrackingId] = useState("");
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (event) => {
    event.preventDefault();

    const id = trackingId.trim().toUpperCase();

    if (!id) {
      setError("Please enter your enquiry tracking ID.");
      setEnquiry(null);
      return;
    }

    setLoading(true);
    setError("");
    setEnquiry(null);

    try {
      const response = await fetch(
        `${API}/enquiries/track/${encodeURIComponent(id)}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to find your enquiry. Please check your tracking ID."
        );
      }

      setEnquiry(data);
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const status = (enquiry?.status || "PENDING").toUpperCase();

  const statusLabels = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED: "Rejected",
  };

  return (
    <main className="tracking-page">
      <section className="tracking-hero">
        <div className="tracking-icon">
          <span aria-hidden="true">⌕</span>
        </div>

        <p className="tracking-eyebrow">HOMESPACE SUPPORT</p>
        <h1>Track Your Enquiry</h1>
        <p className="tracking-description">
          Stay updated on your property enquiry. Enter the tracking
          ID you received after submitting your enquiry.
        </p>

        <form className="tracking-form" onSubmit={handleTrack}>
          <label htmlFor="trackingId">Enquiry Tracking ID</label>

          <input
            id="trackingId"
            type="text"
            placeholder="e.g. HS-ENQ-00004"
            value={trackingId}
            onChange={(event) => setTrackingId(event.target.value)}
            autoComplete="off"
            required
          />

          <p className="tracking-hint">
            Your tracking ID looks like HS-ENQ-00004.
          </p>

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Track Enquiry"}
          </button>
        </form>

        {error && (
          <div className="tracking-error" role="alert">
            {error}
          </div>
        )}
      </section>

      {enquiry && (
        <section className="tracking-result" aria-live="polite">
          <div className="result-heading">
            <div>
              <p className="result-eyebrow">TRACKING DETAILS</p>
              <h2>Your Enquiry</h2>
            </div>

            <span className={`status-badge status-${status.toLowerCase()}`}>
              {statusLabels[status] || status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="tracking-id-display">
            <span>Tracking ID</span>
            <strong>{enquiry.trackingId || trackingId.toUpperCase()}</strong>
          </div>

          <div className="tracking-details-grid">
            <div className="tracking-detail">
              <span>Enquiry Type</span>
              <strong>{enquiry.enquiryType || "—"}</strong>
            </div>

            <div className="tracking-detail">
              <span>Property</span>
              <strong>{enquiry.propertyName || "Not specified"}</strong>
            </div>

            <div className="tracking-detail">
              <span>Date Submitted</span>
              <strong>
                {enquiry.createdAt
                  ? new Date(enquiry.createdAt).toLocaleDateString("en-IN")
                  : "—"}
              </strong>
            </div>

            <div className="tracking-detail">
              <span>Enquiry Status</span>
              <strong>
                {statusLabels[status] || status.replaceAll("_", " ")}
              </strong>
            </div>
          </div>

          <div className="tracking-message">
            <h3>Your Message</h3>
            <p>{enquiry.message || "No message provided."}</p>
          </div>

          <div className="tracking-response">
            <h3>Response from HomeSpace</h3>
            <p>
              {enquiry.adminResponse ||
                "Our team has not added a response yet. Please check again later."}
            </p>
          </div>

          <button
            type="button"
            className="track-again-button"
            onClick={() => {
              setEnquiry(null);
              setError("");
              setTrackingId("");
            }}
          >
            Track Another Enquiry
          </button>
        </section>
      )}
    </main>
  );
}

export default EnquiryTracking;
