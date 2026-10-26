import { BrowserRouter, Routes, Route, Navigate,} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Tenants from "./Tenants";
import Enquiries from "./Enquiries";
import EnquiryTracking from "./EnquiryTracking";
import SiteVisits from "./SiteVisits";
import Reports from "./Reports";
import PropertyDetails from "./PropertyDetails";
import PropertyUnits from "./PropertyUnits";
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

/*code for suffel the catagery wise  */
    
      function filterPropertiesByCategory(propertyList, category) {
        if (category === "ALL") {
          return propertyList;
        }

        const getIntent = (property) =>
          String(property.intent || "").toUpperCase().trim();

        switch (category) {
          case "BUY_HOME":
            return propertyList.filter((property) => {
              const type = String(property.propertyType || "").toLowerCase();
              return (
                type.includes("apartment") &&
                getIntent(property) === "BUY_HOME"
              );
            });

          case "RENT_HOME":
            return propertyList.filter((property) => {
              const type = String(property.propertyType || "").toLowerCase();
              return (
                type.includes("apartment") &&
                getIntent(property) === "RENT_HOME"
              );
            });

          case "BUY_LAND":
            return propertyList.filter(
              (property) => getIntent(property) === "BUY_LAND"
            );

          case "PG_COLIVING":
            return propertyList.filter(
              (property) => getIntent(property) === "PG_COLIVING"
            );

          case "COMMERCIAL":
            return propertyList.filter((property) =>
              ["BUY_COMMERCIAL", "LEASE_COMMERCIAL"].includes(
                getIntent(property)
              )
            );

          default:
            return propertyList;
        }
      }



function HomeSpace() {
    const [page, setPage] = useState(() => {
  const path = window.location.pathname;

  if (path === "/enquiries") return "Enquiries";
  if (path === "/track-enquiry") return "Track Enquiry";
  if (path === "/properties") return "Properties";
  if (path === "/dashboard") return "Dashboard";

  return "Dashboard";
  });
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState({});

  const [propertyUnitPurposes, setPropertyUnitPurposes] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propertyForm, setPropertyForm] = useState(emptyProperty);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState(null);
  const [ownerForm, setOwnerForm] = useState(emptyOwner);
  const [selectedUnitProperty, setSelectedUnitProperty] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  
          useEffect(() => {
            if (!showSortMenu) return;

            const handleOutsideClick = (event) => {
              if (!event.target.closest(".sort-menu-wrapper")) {
                setShowSortMenu(false);
              }
            };

            const handleEscape = (event) => {
              if (event.key === "Escape") {
                setShowSortMenu(false);
              }
            };

            document.addEventListener("click", handleOutsideClick);
            document.addEventListener("keydown", handleEscape);

            return () => {
              document.removeEventListener("click", handleOutsideClick);
              document.removeEventListener("keydown", handleEscape);
            };
          }, [showSortMenu]);


      useEffect(() => {
        function handleOutsideClick(event) {
          if (!event.target.closest(".user-menu-wrapper")) {
            setShowUserMenu(false);
          }
        }
        document.addEventListener("click", handleOutsideClick);
        

        return () => {
          document.removeEventListener("click", handleOutsideClick);
        };
      }, []);

const [propertyView, setPropertyView] = useState("list");
const userEmail = localStorage.getItem("email") || "Logged-in user";

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.assign("/login");
}

 
async function request(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    // Determine which apartment properties have available flats for sale or rent.
    const purposeEntries = await Promise.all(
      propertyData.map(async (property) => {
        const type = String(property.propertyType || property.type || "").toLowerCase();
        if (!type.includes("apartment")) {
          return [property.id, { SALE: false, RENT: false }];
        }

        const [saleUnits, rentUnits] = await Promise.all([
          request(`${API}/properties/${property.id}/units/available?purpose=SALE`)
            .catch(() => []),
          request(`${API}/properties/${property.id}/units/available?purpose=RENT`)
            .catch(() => []),
        ]);

        return [
          property.id,
          {
            SALE: Array.isArray(saleUnits) && saleUnits.length > 0,
            RENT: Array.isArray(rentUnits) && rentUnits.length > 0,
          },
        ];
      })
    );
    setPropertyUnitPurposes(Object.fromEntries(purposeEntries));

    console.log("Dashboard API properties:", propertyData);
console.log("Total properties:", propertyData.length);
      setProperties((previousProperties) => {
        if (!previousProperties.length) {
          return propertyData;
        }

        const updatedProperties = new Map(
          propertyData.map((property) => [property.id, property])
        );

        const existingOrder = previousProperties
          .map((property) => updatedProperties.get(property.id))
          .filter(Boolean);

        const existingIds = new Set(
          previousProperties.map((property) => property.id)
        );

        const newProperties = propertyData.filter(
          (property) => !existingIds.has(property.id)
        );

        return [...existingOrder, ...newProperties];
      });
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
      totalUnits: property.totalUnits ?? "",
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
          totalUnits:
            propertyForm.totalUnits === "" ||
            propertyForm.totalUnits == null
              ? null
              : Number(propertyForm.totalUnits),
        };

        // Remember the current scroll position
        const scrollPosition = window.scrollY;

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

          setNotice(
            editing
              ? "Property updated successfully."
              : "Property added successfully."
          );

          // Restore the previous scroll position after React updates
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: "instant",
            });
          });
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

  const propertyType = (property.propertyType || "").toLowerCase();
  const intent = (property.intent || "").toUpperCase();

  const unitPurposes = propertyUnitPurposes[property.id] || {};
  const matchesCategory =
    selectedCategory === "ALL" ||
    intent === selectedCategory ||
    (selectedCategory === "BUY_HOME" &&
      (unitPurposes.SALE || intent === "BUY_HOME")) ||
    (selectedCategory === "RENT_HOME" &&
      (unitPurposes.RENT || intent === "RENT_HOME")) ||
    (selectedCategory === "BUY_LAND" &&
      (intent === "BUY_LAND" || propertyType.includes("land"))) ||
    (selectedCategory === "PG_COLIVING" &&
      (intent === "PG_COLIVING" ||
        propertyType.includes("pg") ||
        propertyType.includes("co-living") ||
        propertyType.includes("coliving"))) ||
    (selectedCategory === "COMMERCIAL" &&
      (["BUY_COMMERCIAL", "LEASE_COMMERCIAL"].includes(intent) ||
        propertyType.includes("commercial")));

  return (
    matchesSearch &&
    matchesType &&
    matchesStatus &&
    matchesCategory
  );
});


const sortedProperties = [...filteredProperties].sort((a, b) => {
  switch (sortOrder) {
    case "az":
      return (a.propertyName || "").localeCompare(
        b.propertyName || ""
      );

    case "za":
      return (b.propertyName || "").localeCompare(
        a.propertyName || ""
      );

    case "priceLow":
      return (Number(a.price) || 0) - (Number(b.price) || 0);

    case "priceHigh":
      return (Number(b.price) || 0) - (Number(a.price) || 0);

    default:
      return 0;
  }
});


        useEffect(() => {
          const propertyId = sessionStorage.getItem("manageFlatsPropertyId");

          if (!propertyId || properties.length === 0) return;

          const property = properties.find(
            (item) => String(item.id) === propertyId
          );

          if (property) {
            sessionStorage.removeItem("manageFlatsPropertyId");

            // Defer the state update until after the effect completes.
            queueMicrotask(() => {
              setSelectedUnitProperty(property);
            });
          }
        }, [properties]);
  
if (selectedUnitProperty) {
  return (
    <PropertyUnits
      property={selectedUnitProperty}
      API={API}
      request={request}
      onClose={() => {
        setSelectedUnitProperty(null);
        loadData();
      }}
    />
  );
}

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

        {["Dashboard","Properties", "Buy a Home","Rent a Home", "Buy Land", "PG / Co-living",
          "Commercial Property", "Owners", "Tenants", "Enquiries", "Track Enquiry", "Site Visits","Reports",
        "Settings",].map((item) => (
          <button
            key={item}
            className={`nav-item ${page === item ? "active" : ""}`}
            onClick={() => {
              const categoryMap = {
                Properties: "ALL",
                "Buy a Home": "BUY_HOME",
                "Rent a Home": "RENT_HOME",
                "Buy Land": "BUY_LAND",
                "PG / Co-living": "PG_COLIVING",
                "Commercial Property": "COMMERCIAL",
              };

              if (Object.prototype.hasOwnProperty.call(categoryMap, item)) {
                setSelectedCategory(categoryMap[item]);
              }

              setPage(item);
              setError("");
              setNotice("");
            }}
          >
           
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
  <div className="page-heading">
    <h2>{page}</h2>
  </div>

  <div className="header-search">
    <span className="search-icon">⌕</span>
    <input
      type="text"
      placeholder="Search properties by name, address, or type..."
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  </div>

  <div className="user-menu-wrapper">
    <button
      type="button"
      className="user-avatar"
      onClick={(event) => {
        event.stopPropagation();
        setShowUserMenu((open) => !open);
      }}
      aria-label="Open user menu"
      aria-expanded={showUserMenu}
    >
      {userEmail.charAt(0).toUpperCase()}
    </button>

    {showUserMenu && (
      <div className="user-dropdown">
        <strong>{userEmail}</strong>
        <hr />
        <button
          type="button"
          className="user-logout"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>
      </div>
    )}
  </div>
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
                

                {page === "Dashboard" && (
  <section className="property-categories mb-4">
    <div className="row g-3">
      {[
        { label: "All Properties", value: "ALL", icon: "🏘️" },
        { label: "Buy a Home", value: "BUY_HOME", icon: "🏠" },
        { label: "Rent a Home", value: "RENT_HOME", icon: "🔑" },
        { label: "Buy Land", value: "BUY_LAND", icon: "🌳" },
        { label: "PG / Co-living", value: "PG_COLIVING", icon: "🛏️" },
        { label: "Commercial Property", value: "COMMERCIAL", icon: "🏢" },
      ].map((category) => (
        <div className="col-6 col-md-4 col-xl-2" key={category.value}>
          <button
            type="button"
            className={`category-card ${
              selectedCategory === category.value ? "selected" : ""
            }`}
            onClick={() => {
              setSelectedCategory(category.value);
              setPage("Properties");
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <strong>{category.label}</strong>
          </button>
        </div>
      ))}
    </div>
  </section>
)}


                <div className="row g-3 mb-4">
                  <StatCard title="Total Properties" value={stats.totalProperties ?? properties.length} />
                  <StatCard title="Available" value={stats.availableProperties ?? 0} />
                  <StatCard title="Rented" value={stats.rentedProperties ?? 0} />
                  <StatCard title="Total Listed Value" value={formatPrice(stats.totalListedValue)} />
                </div>

              <PropertyList
                    properties={properties.slice(0, 6)}
                    formatPrice={formatPrice}
                    onEdit={openEditPropertyForm}
                    onView={(property) =>
                      window.location.assign(`/properties/${property.id}`)
                    }
                    
                    onDelete={deleteProperty}
                    onAdd={openNewPropertyForm}
                    compact
                    propertyView={propertyView}
                    setPropertyView={setPropertyView}
                    setSelectedUnitProperty={setSelectedUnitProperty}
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


            {[
                "Properties",
                "Buy a Home",
                "Rent a Home",
                "Buy Land",
                "PG / Co-living",
                "Commercial Property",
              ].includes(page) && (
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
                    
                  <div className="property-filter-row">
                    <input
                      type="text"
                      className="form-control property-search-filter"
                      placeholder="Search name or address..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                      className="form-select property-filter-select"
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

                    <select
                      className="form-select property-filter-select"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                    >
                      <option value="">All statuses</option>
                      <option value="Available">Available</option>
                      <option value="Rented">Rented</option>
                      <option value="Sold">Sold</option>
                    </select>

                    <div className="sort-menu-wrapper">
                      <button
                        type="button"
                        className="sort-icon-button"
                        title="Sort properties"
                        aria-label="Sort properties"
                        aria-expanded={showSortMenu}
                        onClick={() => setShowSortMenu((open) => !open)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7h16M7 12h10M10 17h4" />
                        </svg>
                      </button>

                      {showSortMenu && (
                        <div className="sort-dropdown">
                          {[
                            ["default", "Default Order"],
                            ["az", "Name: A to Z"],
                            ["za", "Name: Z to A"],
                            ["priceLow", "Price: Low to High"],
                            ["priceHigh", "Price: High to Low"],
                          ].map(([value, label]) => (
                            <button
                              type="button"
                              key={value}
                              className={`sort-option ${
                                sortOrder === value ? "selected" : ""
                              }`}
                              onClick={() => {
                                setSortOrder(value);
                                setShowSortMenu(false);
                              }}
                            >
                              {label}
                              {sortOrder === value && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                  <PropertyList
                    properties={sortedProperties}
                    formatPrice={formatPrice}
                    onEdit={openEditPropertyForm}
                    onView={(property) =>
                      window.location.assign(`/properties/${property.id}`)
                    }
                    onDelete={deleteProperty}
                    onAdd={openNewPropertyForm}
                    propertyView={propertyView}
                    setPropertyView={setPropertyView}
                    setSelectedUnitProperty={setSelectedUnitProperty}
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

        {page === "Tenants" && (<Tenants />)}
        {page === "Enquiries" && <Enquiries />}
        {page === "Track Enquiry" && <EnquiryTracking />}
        {page === "Site Visits" && <SiteVisits properties={properties} />}
        
              {page === "Reports" && (<Reports
                            properties={properties}
                             owners={owners}/>)}
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

              
                {(propertyForm.propertyType || "")
                  .toLowerCase()
                  .includes("apartment") && (
                    <div className="mb-3">
                      <label className="form-label">Total Units / Flats</label>
                      <input
                        type="number"
                        className="form-control"
                        value={propertyForm.totalUnits ?? 0}
                        readOnly
                      />
                      <small className="text-muted">
                        Automatically updated when flats are added or deleted in Manage Flats.
                      </small>
                    </div>
                  )}


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
          propertyView,
          setPropertyView,
            selectedCategory = "ALL",
        }) {

            const filteredProperties = filterPropertiesByCategory(
            properties,
            selectedCategory
          );

const shownProperties = compact
  ? filteredProperties.slice(0, 6)
  : filteredProperties;
  return (
    <section className="panel">
      
<div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
  <div>
    <h5 className="mb-1">Properties</h5>
    <small className="text-secondary">
      {compact ? "Recently listed properties" : "Property records"}
    </small>
  </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="property-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${
                propertyView === "list" ? "active" : ""
              }`}
              onClick={() => setPropertyView("list")}
              title="List View"
              aria-label="List View"
            >
              ☰ 
            </button>

            <button
              type="button"
              className={`view-toggle-btn ${
                propertyView === "card" ? "active" : ""
              }`}
              onClick={() => setPropertyView("card")}
              title="Card View"
              aria-label="Card View"
            >
              ▦
            </button>
          </div>

    <span className="badge bg-light text-primary">
      {shownProperties.length} properties
    </span>
  </div>
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
) : propertyView === "list" ? (
  <div className="table-responsive">
    <table className="table table-hover align-middle">
      <thead>
        <tr>
          <th>Image</th>
          <th>Property</th>
          <th>Type</th>
          <th>Total Units</th>
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
            <td className="fw-semibold">
              {property.propertyName || property.name}
            </td>
            <td>{property.propertyType || property.type}</td>

            
            <td>
              {(property.propertyType || property.type || "")
                .toLowerCase()
                .includes("apartment")
                ? property.totalUnits != null && property.totalUnits !== ""
                  ? `${property.totalUnits} Flats`
                  : "Not specified"
                : "—"}
            </td>


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
                {property.status || "Available"}
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
) : (
  <div className="row g-3">
    {shownProperties.map((property) => (
      <div className="col-12 col-md-6 col-xl-4" key={property.id}>
        <div className="property-grid-card">
          <img
            src={property.imageUrl || getPropertyImage(property)}
            alt={property.propertyName || "Property"}
            className="property-thumbnail"
            loading="lazy"
          />
          <h5 className="mt-3">
            {property.propertyName || property.name}
          </h5>
          <p>{property.address}</p>
          <h5>{formatPrice(property.price)}</h5>
          <span
            className={`badge ${
              property.status?.toLowerCase() === "available"
                ? "bg-success"
                : "bg-secondary"
            }`}
          >
            {property.status || "Available"}
          </span>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              className="btn btn-info"
              onClick={() => onView(property)}
            >
              View Details
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => onEdit(property)}
            >
              Edit
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => onDelete(property.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}
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


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect home to dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomeSpace />
            </ProtectedRoute>
          }
        />

        {/* Protected properties page */}
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <HomeSpace />
            </ProtectedRoute>
          }
        />

        {/* Protected property details page */}
        <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails
                  onManageFlats={(property) => {
                    sessionStorage.setItem(
                      "manageFlatsPropertyId",
                      String(property.id)
                    );
                    window.location.href = "/";
                  }}
                />
              </ProtectedRoute>
            }
          />
            {/* Protected Enquiries section page */}
              <Route
                path="/enquiries"
                element={
                  <ProtectedRoute>
                    <HomeSpace />
                  </ProtectedRoute>
                }
              />
                 {/* Protected Track Enquiries section page */}
                <Route
                  path="/track-enquiry"
                  element={
                    <ProtectedRoute>
                      <HomeSpace />
                    </ProtectedRoute>
                  }
                />

        {/* Redirect unknown pages */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


