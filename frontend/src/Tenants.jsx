import { useCallback, useEffect, useMemo, useState } from "react";
import "./Tenants.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;
const emptyForm = {
  fullName: "", phone: "", email: "", propertyId: "", unitId: "",
  propertyName: "", unitNumber: "", monthlyRent: "", securityDeposit: "",
  leaseStart: "", leaseEnd: "", status: "PENDING", permanentAddress: "", notes: ""
};
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
.format(Number(value || 0));

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  
const loadTenants = useCallback(async () => {
  setLoading(true);

  try {
    const response = await fetch(`${API}/tenants`);

    if (!response.ok) {
      throw new Error(
        `Unable to load tenants (${response.status})`
      );
    }

    const data = await response.json();
    setTenants(Array.isArray(data) ? data : []);
    setError("");
  } catch (e) {
    setError(
      `${e.message}. Check that your Spring Boot backend is running and /api/tenants is available.`
    );
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  const controller = new AbortController();

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API}/tenants`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Unable to load tenants (${response.status})`);
      }

      const data = await response.json();
      setTenants(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  fetchTenants();

  return () => controller.abort();
}, []);


  const filtered = useMemo(() => tenants.filter((t) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [t.fullName, t.phone, t.email, t.propertyName, t.unitNumber].some((v) => String(v || "")
    .toLowerCase().includes(term));
    return matchesSearch && (statusFilter === "ALL" || String(t.status || "PENDING").toUpperCase() === statusFilter);
  }), [tenants, search, statusFilter]);

  const active = tenants.filter((t) => String(t.status).toUpperCase() === "ACTIVE");
  const expiring = active.filter((t) => {
    if (!t.leaseEnd) return false;
    const days = (new Date(t.leaseEnd) - new Date()) / 86400000;
    return days >= 0 && days <= 30;
  });
  const monthlyRent = active.reduce((sum, t) => sum + Number(t.monthlyRent || 0), 0);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setShowForm(true); };
  const openEdit = (tenant) => {
    setEditingId(tenant.id);
    setForm(Object.fromEntries(Object.keys(emptyForm).map((key) => [key, tenant[key] ?? ""])));
    setError(""); setShowForm(true);
  };
  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    const payload = {
      ...form,
      propertyId: form.propertyId ? Number(form.propertyId) : null,
      unitId: form.unitId ? Number(form.unitId) : null,
      monthlyRent: Number(form.monthlyRent),
      securityDeposit: form.securityDeposit === "" ? null : Number(form.securityDeposit),
      status: form.status || "PENDING"
    };
    try {
      const response = await fetch(`${API}/tenants${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        let message = `Save failed (${response.status})`;
        try {
            const body = await response.json();
            message = body.message || body.error || message;
     } catch (parseError) {
            console.error("Could not parse error response:", parseError);
                }
                
        throw new Error(message);
      }
      setShowForm(false); setForm(emptyForm); setEditingId(null); await loadTenants();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (tenant) => {
    if (!window.confirm(`Delete tenant record for ${tenant.fullName}?`)) return;
    setError("");
    try {
      const response = await fetch(`${API}/tenants/${tenant.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Delete failed (${response.status})`);
      await loadTenants();
    } catch (e) { setError(e.message); }
  };

  return <main className="tenants-page">
    <div className="tenants-heading"><div><h2>Manage Tenants</h2>
    <p>Add, search, update and manage tenant records and lease details.</p>
    </div><button className="tenant-primary" onClick={openCreate}>+ Add Tenant</button></div>
    
    <section className="tenant-stats">
      <article><span>Total Tenants</span><strong>{tenants.length}</strong>
      <small>All registered tenant records</small></article>
      <article><span>Active Tenants</span><strong>{active.length}</strong>
      <small>Currently active leases</small></article>
      <article><span>Leases Expiring Soon</span><strong>{expiring.length}</strong>
      <small>Within the next 30 days</small></article>
      <article><span>Monthly Rent</span><strong>{money(monthlyRent)}</strong>
      <small>Expected from active leases</small></article>
    </section>

    <section className="tenant-panel">
      <div className="tenant-panel-heading"><div><h3>Tenants</h3>
      <p>Tenant and lease records</p></div>
     </div>
      <div className="tenant-filters tenants-toolbar">
        <input
          className="tenant-search"
          aria-label="Search tenants"
          placeholder="Search tenant name, phone, email, property name or unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="tenant-status-filter"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="EXPIRED">Expired</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>
      {error && <div className="tenant-error" role="alert">{error}</div>}
      {loading ? <div className="tenant-empty">Loading tenants...</div> : filtered.length === 0 ? <div className="tenant-empty"><strong>No tenants found</strong><p>Add your first tenant or change your search filters.</p><button className="tenant-primary" onClick={openCreate}>+ Add Tenant</button></div> :
      <div className="tenant-table-wrap"><table className="tenant-table"><thead><tr><th>Tenant</th><th>Contact</th><th>Property / Unit</th><th>Monthly Rent</th><th>Lease Period</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((t) => <tr key={t.id}><td><strong>{t.fullName}</strong><small>Tenant #{t.id}</small></td><td>{t.phone}<small>{t.email || "No email"}</small></td><td>{t.propertyName || (t.propertyId ? `Property #${t.propertyId}` : "Not assigned")}<small>{t.unitNumber || (t.unitId ? `Unit #${t.unitId}` : "No unit")}</small></td><td>{money(t.monthlyRent)}</td><td>{t.leaseStart || "—"}<small>to {t.leaseEnd || "—"}</small></td><td><span className={`tenant-status status-${String(t.status || "PENDING").toLowerCase()}`}>{t.status || "PENDING"}</span></td><td><div className="tenant-actions"><button onClick={() => openEdit(t)}>Edit</button><button className="danger" onClick={() => remove(t)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </section>
    {showForm && <div className="tenant-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="tenant-modal" role="dialog" aria-modal="true" aria-labelledby="tenant-form-title"><div className="tenant-modal-heading"><div><h3 id="tenant-form-title">{editingId ? "Edit Tenant" : "Add Tenant"}</h3><p>Enter the tenant's contact and lease information.</p></div><button type="button" className="tenant-close" onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
      <form onSubmit={submit}><div className="tenant-form-grid">
        <label>Full Name *<input name="fullName" required maxLength="120" value={form.fullName} onChange={change} /></label>
        <label>Phone Number *<input name="phone" required maxLength="30" value={form.phone} onChange={change} /></label>
        <label>Email Address<input name="email" type="email" value={form.email} onChange={change} /></label>
        <label>Status<select name="status" value={form.status} onChange={change}><option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="TERMINATED">Terminated</option></select></label>
        <label>Property ID<input name="propertyId" type="number" min="1" value={form.propertyId} onChange={change} placeholder="Optional for now" /></label>
        <label>Property Name<input name="propertyName" value={form.propertyName} onChange={change} /></label>
        <label>Unit / Flat ID<input name="unitId" type="number" min="1" value={form.unitId} onChange={change} placeholder="Optional for now" /></label>
        <label>Unit Number<input name="unitNumber" value={form.unitNumber} onChange={change} /></label>
        <label>Monthly Rent (₹) *<input name="monthlyRent" type="number" min="0" step="0.01" required value={form.monthlyRent} onChange={change} /></label>
        <label>Security Deposit (₹)<input name="securityDeposit" type="number" min="0" step="0.01" value={form.securityDeposit} onChange={change} /></label>
        <label>Lease Start Date *<input name="leaseStart" type="date" required value={form.leaseStart} onChange={change} /></label>
        <label>Lease End Date *<input name="leaseEnd" type="date" min={form.leaseStart || undefined} required value={form.leaseEnd} onChange={change} /></label>
        <label className="tenant-full-field">Permanent Address<textarea name="permanentAddress" rows="2" value={form.permanentAddress} onChange={change} /></label>
        <label className="tenant-full-field">Notes<textarea name="notes" rows="2" value={form.notes} onChange={change} /></label>
      </div>{error && <div className="tenant-error" role="alert">{error}</div>}<div className="tenant-modal-actions"><button type="button" className="tenant-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="tenant-primary" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Save Tenant"}</button></div></form>
    </section></div>}
  </main>;
}
