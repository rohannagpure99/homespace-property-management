import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./App.css";
import { getPropertyImage } from "./propertyImages";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80";

export default function PropertyDetails() {
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
        setProperty(await response.json());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load property details.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
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
        <div className="alert alert-danger" role="alert">{error}</div>
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
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <span className={`badge ${
                  property.status?.toLowerCase() === "available"
                    ? "bg-success"
                    : "bg-secondary"
                } mb-2`}>
                  {property.status || "Status not specified"}
                </span>
                <h1 className="h2">{property.propertyName || "Property"}</h1>
                <p className="text-secondary">{property.address || "Address not provided"}</p>
              </div>
              <div className="fs-3 fw-bold text-primary">{formatPrice(property.price)}</div>
            </div>

            <hr className="my-4" />
            <h2 className="h5 mb-3">Property Information</h2>
            <div className="row g-3">
              <Info label="Property ID" value={property.id} />
              <Info label="Property Type" value={property.propertyType} />
              <Info label="Status" value={property.status} />
              <Info label="Listed Price" value={formatPrice(property.price)} />
              <Info label="Address" value={property.address} />
            </div>
            <p className="text-secondary mt-4 mb-0">
              To show details such as bedrooms, bathrooms, area, amenities or
              owner information, add those fields to your Property entity and API.
            </p>
          </div>
        </article>
      )}
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="col-sm-6">
      <div className="border rounded p-3 h-100">
        <small className="text-secondary d-block">{label}</small>
        <strong>{value ?? "Not provided"}</strong>
      </div>
    </div>
  );
}
