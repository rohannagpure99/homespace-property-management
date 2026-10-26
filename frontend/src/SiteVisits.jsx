import { useState, useEffect, useMemo, useCallback } from "react";
import "./SiteVisits.css";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:8080"
}/api/site-visits`;

const emptyVisit = {
  visitorName: "",
  phone: "",
  email: "",
  propertyId: "",
  visitDate: "",
  visitTime: "10:00",
  purpose: "BUY",
  status: "Scheduled",
  notes: "",
};

const statusOptions = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "Rescheduled",
];

function displayStatus(status) {
  const normalized = String(status || "SCHEDULED").toUpperCase();

  const statusMap = {
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    RESCHEDULED: "Rescheduled",
  };

  return statusMap[normalized] || "Scheduled";
}

function apiStatus(status) {
  return String(status || "Scheduled").toUpperCase();
}

function getErrorMessage(data, fallback) {
  if (data && typeof data.message === "string") {
    return data.message;
  }

  if (data && typeof data.error === "string") {
    return data.error;
  }

  return fallback;
}

export default function SiteVisits({ properties = [] }) {
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState(emptyVisit);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Get the property name from its ID.
  const propertyName = useCallback(
    (propertyId) => {
      const property = properties.find(
        (item) => String(item.id) === String(propertyId)
      );

      return property
        ? property.propertyName || property.name || `Property ${property.id}`
        : "Property not selected";
    },
    [properties]
  );

  // Convert a backend record into the format used by the form.
  const mapBackendVisit = useCallback(
    (visit) => {
      const matchingProperty = properties.find(
        (property) =>
          String(property.id) === String(visit.propertyId) ||
          (visit.propertyName &&
            (property.propertyName || property.name || "").toLowerCase() ===
              visit.propertyName.toLowerCase())
      );

      return {
        ...visit,
        id: visit.id,
        visitorName: visit.visitorName || "",
        phone: visit.phone || "",
        email: visit.email || "",
        propertyId: matchingProperty
          ? String(matchingProperty.id)
          : String(visit.propertyId || ""),
        propertyName: visit.propertyName || "",
        visitDate: visit.visitDate || "",
        visitTime: String(visit.visitTime || "10:00").slice(0, 5),
        purpose: visit.purpose || "BUY",
        status: displayStatus(visit.status),
        notes: visit.notes || "",
      };
    },
    [properties]
  );

  // Load site visits from Spring Boot.
  const loadSiteVisits = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Unable to load visits (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The backend did not return a list of site visits.");
      }

      setVisits(data.map(mapBackendVisit));
      setFeedback("");
    } catch (error) {
      console.error("Error loading site visits:", error);
      setFeedback(
        "Could not load site visits. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [mapBackendVisit]);

    useEffect(() => {
  let isActive = true;

  async function fetchSiteVisits() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Unable to load visits (${response.status})`);
      }

      const data = await response.json();

      if (isActive && Array.isArray(data)) {
        setVisits(data.map(mapBackendVisit));
      }
    } catch (error) {
      if (isActive) {
        console.error("Error loading site visits:", error);
        setFeedback("Could not load site visits. Check that the backend is running.");
      }
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  }

  fetchSiteVisits();

  return () => {
    isActive = false;
  };
}, [mapBackendVisit]);

  // Resolve property names for searching and displaying visits.
  const filteredVisits = useMemo(() => {
    const term = search.trim().toLowerCase();

    return visits
      .filter((visit) => {
        const name = String(visit.visitorName || "").toLowerCase();
        const phone = String(visit.phone || "").toLowerCase();
        const property = String(
          visit.propertyName || propertyName(visit.propertyId)
        ).toLowerCase();

        const matchesSearch =
          !term ||
          name.includes(term) ||
          phone.includes(term) ||
          property.includes(term);

        const matchesStatus =
          statusFilter === "All" || visit.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) =>
        `${a.visitDate}T${a.visitTime}`.localeCompare(
          `${b.visitDate}T${b.visitTime}`
        )
      );
  }, [visits, search, statusFilter, propertyName]);

  const scheduledCount = visits.filter(
    (visit) => visit.status === "Scheduled"
  ).length;

  const completedCount = visits.filter(
    (visit) => visit.status === "Completed"
  ).length;

  const cancelledCount = visits.filter(
    (visit) => visit.status === "Cancelled"
  ).length;

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openNewForm() {
    setEditingId(null);

    setForm({
      ...emptyVisit,
      visitDate: today,
      propertyId: properties[0] ? String(properties[0].id) : "",
    });

    setFeedback("");
    setShowForm(true);
  }

  function editVisit(visit) {
    setEditingId(visit.id);

    setForm({
      ...emptyVisit,
      ...visit,
      propertyId: String(visit.propertyId || ""),
    });

    setFeedback("");
    setShowForm(true);
  }

  // Create a new visit or update an existing one.
  async function saveVisit(event) {
    event.preventDefault();

    if (saving) return;

    if (!form.propertyId) {
      setFeedback("Please select a property before scheduling a visit.");
      return;
    }

    const selectedProperty = properties.find(
      (property) => String(property.id) === String(form.propertyId)
    );

    if (!selectedProperty) {
      setFeedback("The selected property could not be found.");
      return;
    }

    const requestBody = {
      visitorName: form.visitorName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      propertyName:
        selectedProperty.propertyName ||
        selectedProperty.name ||
        `Property ${selectedProperty.id}`,
      visitDate: form.visitDate,
      visitTime: form.visitTime,
      status: apiStatus(form.status),
      notes: form.notes.trim(),
      purpose: form.purpose,
    };

    try {
      setSaving(true);
      setFeedback("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          getErrorMessage(
            errorData,
            `Unable to save site visit (${response.status})`
          )
        );
      }

      await loadSiteVisits();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyVisit);

      setFeedback(
        isEditing
          ? "Site visit updated successfully."
          : "Site visit scheduled successfully."
      );
    } catch (error) {
      console.error("Error saving site visit:", error);
      setFeedback(error.message || "Unable to save the site visit.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a visit from the database.
  async function deleteVisit(id) {
    if (!window.confirm("Delete this site visit?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Unable to delete site visit (${response.status})`);
      }

      await loadSiteVisits();
      setFeedback("Site visit deleted successfully.");
    } catch (error) {
      console.error("Error deleting site visit:", error);
      setFeedback(error.message || "Unable to delete the site visit.");
    }
  }

  // Update a visit's status through the backend API.
  async function changeStatus(id, status) {
    const previousVisits = visits;

    setVisits((current) =>
      current.map((visit) =>
        visit.id === id ? { ...visit, status } : visit
      )
    );

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: apiStatus(status),
        }),
      });

      if (!response.ok) {
        throw new Error(`Unable to update status (${response.status})`);
      }

      const updatedVisit = await response.json();

      setVisits((current) =>
        current.map((visit) =>
          visit.id === id
            ? mapBackendVisit(updatedVisit)
            : visit
        )
      );

      setFeedback("Visit status updated successfully.");
    } catch (error) {
      setVisits(previousVisits);
      console.error("Error updating visit status:", error);
      setFeedback(error.message || "Unable to update visit status.");
    }
  }

  return (
    <section className="site-visits-page">
      <div className="site-visits-intro">
        <div>
          <p className="site-visits-eyebrow">PROPERTY MANAGEMENT</p>
          <h1>Site Visits</h1>
          <p className="site-visits-subtitle">
            Schedule property viewings and keep track of every visit.
          </p>
        </div>

        <button
          className="site-visits-primary"
          type="button"
          onClick={openNewForm}
        >
          ＋ Schedule Visit
        </button>
      </div>

      <div className="site-visits-stats">
        <article className="site-visits-stat">
          <span className="site-stat-icon blue">▣</span>
          <div>
            <p>Total Visits</p>
            <strong>{visits.length}</strong>
          </div>
        </article>

        <article className="site-visits-stat">
          <span className="site-stat-icon amber">◷</span>
          <div>
            <p>Scheduled</p>
            <strong>{scheduledCount}</strong>
          </div>
        </article>

        <article className="site-visits-stat">
          <span className="site-stat-icon green">✓</span>
          <div>
            <p>Completed</p>
            <strong>{completedCount}</strong>
          </div>
        </article>

        <article className="site-visits-stat">
          <span className="site-stat-icon red">×</span>
          <div>
            <p>Cancelled</p>
            <strong>{cancelledCount}</strong>
          </div>
        </article>
      </div>

      {feedback && (
        <div className="site-visits-feedback" role="status">
          {feedback}
          <button
            type="button"
            onClick={() => setFeedback("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div className="site-visit-modal-backdrop" role="presentation">
          <section
            className="site-visit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-visit-form-title"
          >
            <div className="site-visit-modal-heading">
              <div>
                <h2 id="site-visit-form-title">
                  {editingId !== null
                    ? "Edit Site Visit"
                    : "Schedule a Site Visit"}
                </h2>
                <p>Enter the visitor and appointment details below.</p>
              </div>

              <button
                type="button"
                className="site-visit-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveVisit} className="site-visit-form">
              <label>
                Visitor name *
                <input
                  name="visitorName"
                  value={form.visitorName}
                  onChange={updateField}
                  required
                  maxLength={100}
                  placeholder="Enter visitor's full name"
                />
              </label>

              <label>
                Phone number *
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  required
                  maxLength={20}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  maxLength={150}
                  placeholder="name@example.com"
                />
              </label>

              <label>
                Property *
                <select
                  name="propertyId"
                  value={form.propertyId}
                  onChange={updateField}
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.propertyName ||
                        property.name ||
                        `Property ${property.id}`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Visit date *
                <input
                  name="visitDate"
                  type="date"
                  value={form.visitDate}
                  onChange={updateField}
                  min={today}
                  required
                />
              </label>

              <label>
                Visit time *
                <input
                  name="visitTime"
                  type="time"
                  value={form.visitTime}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Visit purpose
                <select
                  name="purpose"
                  value={form.purpose}
                  onChange={updateField}
                >
                  <option value="BUY">Buy</option>
                  <option value="RENT">Rent</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="site-visit-notes">
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  rows="3"
                  maxLength={1000}
                  placeholder="Any special requests or additional details"
                />
              </label>

              {properties.length === 0 && (
                <p className="site-visit-warning">
                  No properties are loaded yet. Add a property first, then
                  schedule a visit.
                </p>
              )}

              <div className="site-visit-form-actions">
                <button
                  type="button"
                  className="site-visit-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="site-visits-primary"
                  disabled={saving || properties.length === 0}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Schedule Visit"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="site-visits-table-card">
        <div className="site-visits-table-heading">
          <div>
            <h2>Visit Schedule</h2>
            <p>View and manage property appointments.</p>
          </div>

          <span className="site-visits-count">
            {filteredVisits.length}{" "}
            {filteredVisits.length === 1 ? "visit" : "visits"}
          </span>
        </div>

        <div className="site-visits-toolbar">
          <label className="site-visits-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search visitor, phone, or property..."
            />
          </label>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option>All</option>
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="site-visits-empty">
            <h3>Loading site visits...</h3>
          </div>
        ) : properties.length === 0 && visits.length === 0 ? (
          <div className="site-visits-empty">
            <span>▣</span>
            <h3>No properties available</h3>
            <p>
              Add properties to HomeSpace first, then you can schedule and
              manage site visits here.
            </p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="site-visits-empty">
            <span>◷</span>
            <h3>No site visits found</h3>
            <p>Schedule a visit to start building your appointment list.</p>
            <button
              className="site-visits-primary"
              type="button"
              onClick={openNewForm}
            >
              ＋ Schedule Visit
            </button>
          </div>
        ) : (
          <div className="site-visits-table-wrap">
            <table className="site-visits-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Property</th>
                  <th>Date &amp; time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <div className="site-visitor-name">
                        {visit.visitorName}
                      </div>
                      <div className="site-visitor-contact">
                        {visit.phone}
                        {visit.email ? ` · ${visit.email}` : ""}
                      </div>
                      <small className="site-visit-id">{visit.id}</small>
                    </td>

                    <td>
                      {visit.propertyName ||
                        propertyName(visit.propertyId)}
                    </td>

                    <td>
                      <strong>{visit.visitDate}</strong>
                      <small className="site-visit-time">
                        {visit.visitTime}
                      </small>
                    </td>

                    <td>
                      <span className="site-visit-purpose">
                        {visit.purpose || "—"}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`site-visit-status status-${visit.status.toLowerCase()}`}
                        aria-label={`Status for ${visit.visitorName}`}
                        value={visit.status}
                        onChange={(event) =>
                          changeStatus(visit.id, event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div className="site-visit-actions">
                        <button
                          type="button"
                          onClick={() => editVisit(visit)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete"
                          onClick={() => deleteVisit(visit.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="site-visits-storage-note">
        Site visits are loaded and managed through the HomeSpace backend.
      </p>
    </section>
  );
}
