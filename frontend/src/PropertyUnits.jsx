import { useCallback, useEffect, useState } from "react";

export default function PropertyUnits({
  property,
  API,
  request,
  onClose,
}) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    unitNumber: "",
    purpose: "SALE",
    price: "",
    status: "AVAILABLE",
  };

  const [form, setForm] = useState(emptyForm);

  // Load all flats belonging to this property.
  const loadUnits = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request(
        `${API}/properties/${property.id}/units`
      );

      setUnits(data);
      return data;
    } catch (err) {
      setError(err.message || "Unable to load flats.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [API, property.id, request]);

 
        useEffect(() => {
          let cancelled = false;
          async function fetchUnits() {
            setError("");
            try {
              const data = await request(
                `${API}/properties/${property.id}/units`
              );
              if (!cancelled) {
                setUnits(data);
              }
            } catch (err) {
              if (!cancelled) {
                setError(err.message || "Unable to load flats.");
              }
            } finally {
              if (!cancelled) {
                setLoading(false);
              }
            }
          }

          fetchUnits();

          return () => {
            cancelled = true;
          };
        }, [API, property.id, request]);


  function startEdit(unit) {
    setEditingId(unit.id);

    setForm({
      unitNumber: unit.unitNumber ?? "",
      purpose: unit.purpose ?? "SALE",
      price: unit.price ?? "",
      status: unit.status ?? "AVAILABLE",
    });

    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  // Save a new flat or update an existing flat.
  async function saveUnit(event) {
    event.preventDefault();
    setError("");

    if (form.unitNumber.trim() === "" || form.price === "") {
      setError("Enter the flat number and price.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    const payload = {
      unitNumber: form.unitNumber.trim(),
      purpose: form.purpose,
      price,
      status: form.status,
    };

    setSaving(true);

    try {
      const url = editingId
        ? `${API}/properties/${property.id}/units/${editingId}`
        : `${API}/properties/${property.id}/units`;

      await request(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      resetForm();

      // Refresh the flat list after saving.
      await loadUnits();
    } catch (err) {
      setError(err.message || "Unable to save the flat.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a flat.
  async function deleteUnit(unitId) {
    if (!window.confirm("Are you sure you want to delete this flat?")) {
      return;
    }

    setError("");

    try {
      await request(
        `${API}/properties/${property.id}/units/${unitId}`,
        { method: "DELETE" }
      );

      // Refresh the flat list after deletion.
      await loadUnits();

      if (editingId === unitId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete the flat.");
    }
  }

  const saleCount = units.filter(
    (unit) =>
      unit.purpose === "SALE" &&
      unit.status === "AVAILABLE"
  ).length;

  const rentCount = units.filter(
    (unit) =>
      unit.purpose === "RENT" &&
      unit.status === "AVAILABLE"
  ).length;

  const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value ?? 0);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>Manage Flats</h2>
          <h5>{property.propertyName}</h5>
          <p className="text-muted mb-0">
            {property.address}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          Back to Properties
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 h-100">
            <div className="text-muted">Total Flats</div>
            <h3>{units.length}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 h-100">
            <div className="text-muted">Available for Sale</div>
            <h3>{saleCount}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 h-100">
            <div className="text-muted">Available for Rent</div>
            <h3>{rentCount}</h3>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <h5>{editingId ? "Edit Flat" : "Add New Flat"}</h5>

        <form onSubmit={saveUnit}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Flat Number</label>
              <input
                className="form-control"
                value={form.unitNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unitNumber: e.target.value,
                  })
                }
                placeholder="e.g. 101"
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Purpose</label>
              <select
                className="form-select"
                value={form.purpose}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purpose: e.target.value,
                    status: "AVAILABLE",
                  })
                }
              >
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                {form.purpose === "RENT"
                  ? "Monthly Rent (₹)"
                  : "Sale Price (₹)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="AVAILABLE">Available</option>
                {form.purpose === "SALE" ? (
                  <option value="SOLD">Sold</option>
                ) : (
                  <option value="RENTED">Rented</option>
                )}
              </select>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Flat"
                  : "Add Flat"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card p-3">
        <h5>Flat List</h5>

        {loading ? (
          <p>Loading flats...</p>
        ) : units.length === 0 ? (
          <p className="text-muted">
            No flats added yet. Use the form above to add your first flat.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Flat</th>
                  <th>Purpose</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td>{unit.unitNumber}</td>
                    <td>
                      {unit.purpose === "RENT" ? "Rent" : "Sale"}
                    </td>
                    <td>
                      {currency(unit.price)}
                      {unit.purpose === "RENT" ? "/month" : ""}
                    </td>
                    <td>{unit.status}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(unit)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteUnit(unit.id)}
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
      </div>
    </div>
  );
}
