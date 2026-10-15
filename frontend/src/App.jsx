import { BrowserRouter, Routes, Route } from "react-router-dom";
import PropertyDetails from "./PropertyDetails";
import { getPropertyImage } from "./propertyImages";
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;
const emptyProperty = {

  propertyName: "",
  propertyType: "Apartment",
  address: "",
  price: "",
  status: "Available",
  imageUrl: "",
};

const emptyOwner = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

function HomeSpace() {
  const [page, setPage] = useState("Dashboard");
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propertyForm, setPropertyForm] = useState(emptyProperty);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState(null);
  const [ownerForm, setOwnerForm] = useState(emptyOwner);

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const details = Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message || body.error || `Request failed (${response.status})`;

      throw new Error(details);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  const loadData = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const [propertyData, ownerData, statsData] = await Promise.all([
      request(`${API}/properties`),
      request(`${API}/owners`),
      request(`${API}/dashboard/statistics`),
    ]);

    setProperties(propertyData);
    setOwners(ownerData);
    setStats(statsData);
  } catch (err) {
    setError(err.message || "Could not load data.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  }

  function showMessage(message) {
    setNotice(message);
    setError("");
  }

  function openNewPropertyForm() {
    setEditingPropertyId(null);
    setPropertyForm(emptyProperty);
    setShowPropertyForm(true);
    setError("");
  }

  function openEditPropertyForm(property) {
    setEditingPropertyId(property.id);
    setPropertyForm({
      propertyName: property.propertyName || "",
      propertyType: property.propertyType || "Apartment",
      address: property.address || "",
      price: property.price ?? "",
      status: property.status || "Available",
      imageUrl: property.imageUrl || "",
    });

    setShowPropertyForm(true);
    setError("");
  }

  async function saveProperty(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    const payload = {
      ...propertyForm,
      price: Number(propertyForm.price),
    };

    try {
      const editing = editingPropertyId !== null;
      await request(
        editing
          ? `${API}/properties/${editingPropertyId}`
          : `${API}/properties`,
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setShowPropertyForm(false);
      await loadData();
      showMessage(editing ? "Property updated successfully." : "Property added successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProperty(id) {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await request(`${API}/properties/${id}`, { method: "DELETE" });
      await loadData();
      showMessage("Property deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  function openNewOwnerForm() {
    setEditingOwnerId(null);
    setOwnerForm(emptyOwner);
    setShowOwnerForm(true);
    setError("");
  }

  function openEditOwnerForm(owner) {
    setEditingOwnerId(owner.id);
    setOwnerForm({
      name: owner.name || "",
      email: owner.email || "",
      phone: owner.phone || "",
      address: owner.address || "",
    });

    setShowOwnerForm(true);
    setError("");
  }

  async function saveOwner(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const editing = editingOwnerId !== null;
      await request(
        editing
          ? `${API}/owners/${editingOwnerId}`
          : `${API}/owners`,
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(ownerForm),
        }
      );
      setShowOwnerForm(false);
      await loadData();
      showMessage(editing ? "Owner updated successfully." : "Owner added successfully.");
   }catch (err) {
      setError(err.message);
    }

  }

  async function deleteOwner(id) {
    if (!window.confirm("Are you sure you want to delete this owner?")) {
      return;
    }
    try {
      await request(`${API}/owners/${id}`, { method: "DELETE" });
      await loadData();
      showMessage("Owner deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredProperties = properties.filter((property) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      property.propertyName?.toLowerCase().includes(term) ||
      property.address?.toLowerCase().includes(term);

    const matchesType =
      !typeFilter || property.propertyType === typeFilter;

    const matchesStatus =
      !statusFilter || property.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="portal">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">H</div>
          <div>
            <h4>HomeSpace</h4>
            <small>Property Management</small>
          </div>
        </div>
        <div className="menu-label">MAIN MENU</div>

        {["Dashboard", "Properties", "Owners"].map((item) => (
          <button
            key={item}
            className={`nav-item ${page === item ? "active" : ""}`}
            onClick={() => {
              setPage(item);
              setError("");
              setNotice("");
            }}
          >
            <span>{item === "Dashboard" ? "▦" : item === "Properties" ? "⌂" : "♙"}</span>
            {item}
          </button>
        ))}

        <div className="sidebar-footer">
          <strong>Real Estate Portal</strong>
          <small>Property management made simple</small>
        </div>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <small className="text-secondary">Workspace / {page}</small>
            <h2>{page}</h2>
          </div>

          <button className="btn btn-outline-primary" onClick={loadData}>
            ↻ Refresh
          </button>
        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="alert alert-success" role="status">
            {notice}

            <button
              type="button"
              className="btn-close float-end"
              aria-label="Dismiss"
              onClick={() => setNotice("")}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Loading data...</p>
          </div>

        ) : (
          <>
            {page === "Dashboard" && (
              <>
                <section className="welcome-card mb-4">        
                <section className="workspace-welcome">
                  <div className="welcome-content">
                    <h3>Welcome to your workspace</h3>
                    <p>
                      Manage your properties and owners from one place.
                    </p>
                  </div>
                </section>
                </section>

                <div className="row g-3 mb-4">
                  <StatCard title="Total Properties" value={stats.totalProperties ?? properties.length} />
                  <StatCard title="Available" value={stats.availableProperties ?? 0} />
                  <StatCard title="Rented" value={stats.rentedProperties ?? 0} />
                  <StatCard title="Total Listed Value" value={formatPrice(stats.totalListedValue)} />
                </div>

                <PropertyList
                  properties={properties.slice(0, 5)}
                  formatPrice={formatPrice}
                  onEdit={openEditPropertyForm}
                  onView={(property) => window.location.assign(`/properties/${property.id}`)}
                    onDelete={deleteProperty}
                  onAdd={openNewPropertyForm}
                  compact
                />

                <div className="text-end mt-3">
                  <button
                    className="btn btn-link"
                    onClick={() => setPage("Properties")}
                  >
                    View all properties →
                  </button>
                </div>
              </>
            )}


            {page === "Properties" && (
              <>
                <div className="panel mb-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                    <div>
                      <h5 className="mb-1">Manage Properties</h5>
                      <small className="text-secondary">
                        Add, search, update and remove property records.
                      </small>
                    </div>

                    <button className="btn btn-primary" onClick={openNewPropertyForm}>
                      + Add Property
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Search name or address..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>

                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                      >

                        <option value="">All types</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Villa">Villa</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                      >
                        <option value="">All statuses</option>
                        <option value="Available">Available</option>
                        <option value="Rented">Rented</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>
                  </div>
                </div>

                <PropertyList
                  properties={filteredProperties}
                  formatPrice={formatPrice}
                  onEdit={openEditPropertyForm}
                  onView={(property) => window.location.assign(`/properties/${property.id}`)}
                    onDelete={deleteProperty}
                  onAdd={openNewPropertyForm}
                />
              </>
            )}

            {page === "Owners" && (
              <section className="panel">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                  <div>
                    <h5 className="mb-1">Manage Owners</h5>
                    <small className="text-secondary">
                      Keep owner contact details up to date.
                    </small>
                  </div>

                  <button className="btn btn-primary" onClick={openNewOwnerForm}>
                    + Add Owner
                  </button>
                </div>

                {owners.length === 0 ? (
                  <EmptyState message="No owners have been added yet." />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Address</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {owners.map((owner) => (
                          <tr key={owner.id}>
                            <td className="fw-semibold">{owner.name}</td>
                            <td>{owner.email}</td>
                            <td>{owner.phone}</td>
                            <td>{owner.address}</td>
                            <td>

                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openEditOwnerForm(owner)}
                                >
                                  Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteOwner(owner.id)}
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
            )}
          </>
        )}
      </main>


      {showPropertyForm && (
        <div className="modal-backdrop-custom">
          <div className="form-dialog">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">
                {editingPropertyId !== null ? "Edit Property" : "Add Property"}
              </h5>
              <button
                className="btn-close"
                onClick={() => setShowPropertyForm(false)}
                aria-label="Close"
              />
            </div>


            <form onSubmit={saveProperty}>
              <div className="mb-3">
                <label className="form-label">Property Name</label>
                <input
                  className="form-control"
                  required
                  maxLength={100}
                  value={propertyForm.propertyName}
                  onChange={(event) =>
                    setPropertyForm({ ...propertyForm, propertyName: event.target.value })
                  }

                  placeholder="e.g. Green Valley Apartment"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Property Type</label>
                <select
                  className="form-select"
                  value={propertyForm.propertyType}
                  onChange={(event) =>
                    setPropertyForm({ ...propertyForm, propertyType: event.target.value })
                  }

                >
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Villa</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  required
                  rows="2"
                  value={propertyForm.address}
                  onChange={(event) =>
                    setPropertyForm({ ...propertyForm, address: event.target.value })
                  }

                  placeholder="Enter full property address"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Property Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/property.jpg"
                  value={propertyForm.imageUrl || ""}
                  onChange={(event) =>
                    setPropertyForm({ ...propertyForm, imageUrl: event.target.value })
                  }
                />

                <small className="text-secondary">Paste a direct link to the property photo.</small>
                {propertyForm.imageUrl && (
                  <img
                    src={propertyForm.imageUrl}
                    alt="Property preview"
                    style={{ width: 160, height: 100, objectFit: "cover", display: "block", marginTop: 12, borderRadius: 8 }}
                  />
                )}

              </div>
              <div className="mb-3">
                <label className="form-label">Price (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={propertyForm.price}
                  onChange={(event) =>
                    setPropertyForm({ ...propertyForm, price: event.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={propertyForm.status}
                  onChange={(event) =>
                    setPropertyForm({ ...propertyForm, status: event.target.value })
                  }

                >
                  <option>Available</option>
                  <option>Rented</option>
                  <option>Sold</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowPropertyForm(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-primary" type="submit">
                  {editingPropertyId !== null ? "Save Changes" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOwnerForm && (
        <div className="modal-backdrop-custom">
          <div className="form-dialog">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">
                {editingOwnerId !== null ? "Edit Owner" : "Add Owner"}
              </h5>
              <button
                className="btn-close"
                onClick={() => setShowOwnerForm(false)}
                aria-label="Close"
              />
            </div>

            <form onSubmit={saveOwner}>
              <div className="mb-3">
                <label className="form-label">Owner Name</label>
                <input
                  className="form-control"
                  required
                  maxLength={100}
                  value={ownerForm.name}
                  onChange={(event) =>
                    setOwnerForm({ ...ownerForm, name: event.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  required
                  value={ownerForm.email}
                  onChange={(event) =>
                    setOwnerForm({ ...ownerForm, email: event.target.value })
                  }

                  placeholder="name@example.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  type="tel"
                  required
                  pattern="[0-9+() -]{7,20}"
                  title="Enter a valid phone number"
                  value={ownerForm.phone}
                  onChange={(event) =>
                    setOwnerForm({ ...ownerForm, phone: event.target.value })
                  }

                  placeholder="Enter phone number"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  required
                  rows="2"
                  value={ownerForm.address}
                  onChange={(event) =>
                    setOwnerForm({ ...ownerForm, address: event.target.value })
                  }

                  placeholder="Enter address"
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowOwnerForm(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  {editingOwnerId !== null ? "Save Changes" : "Add Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

      function StatCard({ title, value }) {
        return (
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card h-100">
              <p className="text-secondary mb-2">{title}</p>
              <h3 className="stat-value mb-0">{value}</h3>
            </div>
          </div>
        );
      }

function PropertyList({
  properties,
  formatPrice,
  onEdit,
  onView,
  onDelete,
  onAdd,
  compact = false,
}) {

  const shownProperties = properties;
  return (
    <section className="panel">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h5 className="mb-1">Properties</h5>
          <small className="text-secondary">
            {compact ? "Recently listed properties" : "Property records"}
          </small>
        </div>

        <span className="badge bg-light text-primary">
          {shownProperties.length} properties
        </span>
      </div>

      {shownProperties.length === 0 ? (
        <EmptyState
          message="No properties found. Add your first property to get started."
          action={
            <button className="btn btn-primary" onClick={onAdd}>
              + Add Property
            </button>
          }
        />

      ) : (

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Image</th>
                <th>Property</th>
                <th>Type</th>
                <th>Address</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>
            <tbody>
              {shownProperties.map((property) => (
                <tr key={property.id}>
                  <td>
                    <img
                      src={property.imageUrl || getPropertyImage(property)}
                      alt={property.propertyName || "Property"}
                      className="property-thumbnail"
                      loading="lazy"
                    />
                  </td>

                  <td className="fw-semibold">{property.propertyName}</td>
                  <td>{property.propertyType}</td>
                  <td>{property.address}</td>
                  <td>{formatPrice(property.price)}</td>
                  <td>

                    <span
                      className={`badge ${
                        property.status?.toLowerCase() === "available"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}

                    >
                      {property.status}
                    </span>
                  </td>

                  <td>
                    <div className="property-actions">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => onView(property)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(property)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(property.id)}
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
  );
}

function EmptyState({ message, action }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {action}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeSpace />} />
        <Route path="/properties" element={<HomeSpace />} />
        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
