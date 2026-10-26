import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./App.css";
import { getPropertyImage } from "./propertyImages";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80";

export default function PropertyDetails({ onManageFlats }) {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/properties/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Property not found."
              : `Could not load property (${response.status}).`
          );
        }

        const data = await response.json();
        setProperty(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load property details.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => controller.abort();
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const owner = property?.owner;
  const ownerPhone = String(owner?.phone || "").replace(/\D/g, "");

  // Prepare the phone number for WhatsApp.
  const whatsappPhone = ownerPhone.startsWith("0")
    ? ownerPhone.substring(1)
    : ownerPhone;

  const area = property?.areaSqFt;

  const amenities = Array.isArray(property?.amenities)
    ? property.amenities.join(", ")
    : property?.amenities;

  const propertyType = String(
    property?.propertyType || property?.type || ""
  ).toLowerCase();

  const isApartment = propertyType.includes("apartment");

  const handleManageFlats = () => {
  if (property && typeof onManageFlats === "function") {
    onManageFlats(property);
  } else {
    alert("Manage Flats is not connected in App.jsx yet.");
  }
  };

  return (
    <main className="container py-4">
      <Link to="/properties" className="btn btn-outline-primary mb-4">
        ← Back to Properties
      </Link>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading property details...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && property && (
        <article className="card border-0 shadow-sm overflow-hidden property-details-content">
          <img
            src={getPropertyImage(property)}
            alt={property.propertyName || "Property"}
            className="property-detail-image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_IMAGE;
            }}
          />

          <div className="card-body p-4 p-md-5">
            {/* Property heading and actions */}
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <span
                  className={`badge ${
                    property.status?.toLowerCase() === "available"
                      ? "bg-success"
                      : "bg-secondary"
                  } mb-2`}
                >
                  {property.status || "Status not specified"}
                </span>

                <h1 className="h2">
                  {property.propertyName || "Property"}
                </h1>

                <p className="text-secondary">
                  {property.address || "Address not provided"}
                </p>
              </div>

              <div className="d-flex flex-column align-items-start align-items-md-end gap-3">
                <div className="fs-3 fw-bold text-primary">
                  {formatPrice(property.price)}
                </div>

               {isApartment && (
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={handleManageFlats}
                >
                  Manage Flats
                </button>
              )}
              
              </div>
            </div>

            <hr className="my-4" />

            {/* Basic information */}
            <h2 className="h5 mb-3">Property Information</h2>

            <div className="row g-3">
              <Info label="Property ID" value={property.id} />
              <Info label="Property Type" value={property.propertyType || property.type} />
              <Info label="Purpose" value={property.intent} />
              <Info label="Status" value={property.status} />
              <Info label="Listed Price" value={formatPrice(property.price)} />
              <Info label="Address" value={property.address} />
              {isApartment && (
                <Info label="Total Units / Flats" value={property.totalUnits} />
              )}
            </div>

            <hr className="my-4" />

            {/* Property size and rooms */}
            <h2 className="h5 mb-3">Size & Room Details</h2>

            <div className="row g-3">
              <Info
                label="Area"
                value={
                  area != null && area !== ""
                    ? `${Number(area).toLocaleString("en-IN")} sq. ft.`
                    : null
                }
              />

              <Info label="Bedrooms" value={property.bedrooms} />
              <Info label="Bathrooms" value={property.bathrooms} />
              <Info label="Balconies" value={property.balconies} />
              <Info label="Parking Spaces" value={property.parkingSpaces} />
              <Info label="Floor Number" value={property.floorNumber} />
              <Info label="Total Floors" value={property.totalFloors} />
              <Info label="Year Built" value={property.yearBuilt} />
              <Info label="Furnishing" value={property.furnishing} />
            </div>

            {/* Amenities */}
            <hr className="my-4" />

            <h2 className="h5 mb-3">Amenities & Facilities</h2>

            {amenities ? (
              <div className="border rounded p-3">{amenities}</div>
            ) : (
              <p className="text-secondary">No amenities listed yet.</p>
            )}

            {/* Owner information */}
            <hr className="my-4" />

            <h2 className="h5 mb-3">Owner Information</h2>

            {owner ? (
              <div className="border rounded p-4">
                <div className="row g-3">
                  <Info label="Owner Name" value={owner.name} />
                  <Info label="Phone Number" value={owner.phone} />
                  <Info label="Email Address" value={owner.email} />
                  <Info label="Owner Address" value={owner.address} />
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  {owner.phone && (
                    <a className="btn btn-primary" href={`tel:${owner.phone}`}>
                      📞 Call Owner
                    </a>
                  )}

                  {whatsappPhone && (
                    <a
                      className="btn btn-success"
                      href={`https://wa.me/${whatsappPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp Owner
                    </a>
                  )}

                  {owner.email && (
                    <a
                      className="btn btn-outline-primary"
                      href={`mailto:${owner.email}`}
                    >
                      ✉️ Email Owner
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                Owner information is not linked to this property yet.
              </div>
            )}
          </div>
        </article>
      )}
    </main>
  );
}

function Info({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Not provided"
      : value;

  return (
    <div className="col-sm-6">
      <div className="border rounded p-3 h-100">
        <small className="text-secondary d-block">{label}</small>
        <strong>{displayValue}</strong>
      </div>
    </div>
  );
}
