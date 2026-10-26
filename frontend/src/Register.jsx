
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  intent: "",
  propertyType: "",
  state: "",
  city: "",
  locality: "",
  budget: "",
  bedrooms: "",
  address: "",
  pincode: "",
  price: "",
  propertySize: "",
  listingUrl: "",
  documentUrl: "",
  description: "",
  furnishing: "",
  possessionTimeline: "",
  moveInDate: "",
  sharingPreference: "",
  mealsPreference: "",
  landType: "",
  intendedUse: "",
  leaseDuration: "",
  availabilityDate: "",
  ownershipStatus: "",
};

const cityOptions = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Karnataka: ["Bengaluru"],
  Telangana: ["Hyderabad"],
  Delhi: ["New Delhi"],
  "Tamil Nadu": ["Chennai"],
  "West Bengal": ["Kolkata"],
  Gujarat: ["Ahmedabad", "Surat"],
  Rajasthan: ["Jaipur"],
  "Uttar Pradesh": ["Lucknow"],
  Kerala: ["Kochi"],
  Haryana: ["Gurugram"],
  "Madhya Pradesh": ["Indore", "Bhopal"],
  Punjab: ["Chandigarh"],
  Bihar: ["Patna"],
  Odisha: ["Bhubaneswar"],
};

const requirements = [
  { value: "BUY_HOME", label: "Buy a Home" },
  { value: "RENT_HOME", label: "Rent a Home" },
  { value: "BUY_LAND", label: "Buy a Plot / Land" },
  { value: "PG_COLIVING", label: "PG / Co-living" },
  { value: "BUY_COMMERCIAL", label: "Buy Commercial Space" },
  { value: "LEASE_COMMERCIAL", label: "Lease Commercial Space" },
  { value: "SELL_PROPERTY", label: "Sell a Property" },
  { value: "RENT_OUT", label: "Rent Out a Property" },
  {
    value: "LEASE_OUT_COMMERCIAL",
    label: "Lease Out Commercial Space",
  },
];

const propertyTypes = [
  "Apartment / Flat",
  "Independent House",
  "Villa",
  "Residential Plot",
  "Office",
  "Shop",
  "Showroom",
  "Warehouse",
  "Commercial Building",
];

const ownerRequirements = [
  "SELL_PROPERTY",
  "RENT_OUT",
  "LEASE_OUT_COMMERCIAL",
];

const homeRequirements = [
  "BUY_HOME",
  "RENT_HOME",
  "RENT_OUT",
];

const commercialRequirements = [
  "BUY_COMMERCIAL",
  "LEASE_COMMERCIAL",
  "LEASE_OUT_COMMERCIAL",
];

const purchaseRequirements = [
  "BUY_HOME",
  "BUY_LAND",
  "BUY_COMMERCIAL",
];

const rentalRequirements = [
  "RENT_HOME",
  "PG_COLIVING",
  "LEASE_COMMERCIAL",
];

const leaseRequirements = [
  "LEASE_COMMERCIAL",
  "LEASE_OUT_COMMERCIAL",
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleStateChange(event) {
    const selectedState = event.target.value;

    setForm((previous) => ({
      ...previous,
      state: selectedState,
      city: "",
      locality: "",
    }));
  }

  function handleRequirementChange(event) {
    const selectedIntent = event.target.value;

    setForm((previous) => ({
      ...initialForm,
      name: previous.name,
      email: previous.email,
      phone: previous.phone,
      password: previous.password,
      confirmPassword: previous.confirmPassword,
      intent: selectedIntent,
    }));

    setFiles([]);
    setMessage("");
  }

  function handleFiles(event) {
    setFiles(Array.from(event.target.files || []));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (!form.intent) {
      setMessage("Please select a property requirement.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "USER",
        intent: form.intent,
        propertyType: form.propertyType,
        state: form.state,
        city: form.city,
        locality: form.locality.trim(),
        budget: form.budget,
        bedrooms: form.bedrooms,
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        price: form.price,
        propertySize: form.propertySize,
        listingUrl: form.listingUrl.trim(),
        documentUrl: form.documentUrl.trim(),
        description: form.description.trim(),
        furnishing: form.furnishing,
        possessionTimeline: form.possessionTimeline,
        moveInDate: form.moveInDate,
        sharingPreference: form.sharingPreference,
        mealsPreference: form.mealsPreference,
        landType: form.landType,
        intendedUse: form.intendedUse,
        leaseDuration: form.leaseDuration,
        availabilityDate: form.availabilityDate,
        ownershipStatus: form.ownershipStatus,
      };

      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Registration failed."
        );
      }

      setMessage("Account created successfully. You can now sign in.");

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  const isOwner = ownerRequirements.includes(form.intent);
  const isHome = homeRequirements.includes(form.intent);
  const isCommercial = commercialRequirements.includes(form.intent);
  const isPurchase = purchaseRequirements.includes(form.intent);
  const isRental = rentalRequirements.includes(form.intent);
  const isLease = leaseRequirements.includes(form.intent);

  return (
    <div className="auth-page register-page">
      <div className="auth-card register-card">
        <div className="auth-building" aria-hidden="true">
          <svg
            viewBox="0 0 48 48"
            width="38"
            height="38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 42V15L24 6L40 15V42"
              stroke="#7DD3FC"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M18 42V32H30V42"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M15 19H19M29 19H33M15 25H19M29 25H33"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1>HomeSpace</h1>

        <p className="auth-subtitle">Create your account</p>

        <h2>Get Started</h2>

        <p>Tell us about yourself and your property needs.</p>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL DETAILS */}

          <h3 className="register-section-title">
            Personal Details
          </h3>

          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="phone">Mobile Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter your mobile number"
            autoComplete="tel"
            pattern="[0-9+\-\s()]{10,15}"
            title="Enter a valid phone number"
            required
          />

          <label htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          {/* PROPERTY REQUIREMENT */}

          <h3 className="register-section-title">
            What would you like to do?
          </h3>

          <label htmlFor="intent">
            Property Requirement *
          </label>

          <select
            id="intent"
            name="intent"
            value={form.intent}
            onChange={handleRequirementChange}
            required
          >
            <option value="">Select your requirement</option>
            {requirements.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {/* DYNAMIC PROPERTY DETAILS */}

          {form.intent && (
            <>
              <h3 className="register-section-title">
                {isOwner
                  ? "Property Details"
                  : "Property Preferences"}
              </h3>

              <label htmlFor="propertyType">Property Type *</label>
              <select
                id="propertyType"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                required
              >
                <option value="">Select property type</option>
                {propertyTypes
                  .filter((type) => {
                    if (form.intent === "BUY_LAND") {
                      return type === "Residential Plot";
                    }

                    if (isCommercial) {
                      return [
                        "Office",
                        "Shop",
                        "Showroom",
                        "Warehouse",
                        "Commercial Building",
                      ].includes(type);
                    }

                    if (form.intent === "PG_COLIVING") {
                      return [
                        "Apartment / Flat",
                        "Independent House",
                      ].includes(type);
                    }

                    return [
                      "Apartment / Flat",
                      "Independent House",
                      "Villa",
                    ].includes(type);
                  })
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>

              <label htmlFor="state">
                {isOwner ? "Property State *" : "Preferred State *"}
              </label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleStateChange}
                required
              >
                <option value="">Select state</option>
                {Object.keys(cityOptions).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              <label htmlFor="city">
                {isOwner ? "Property City *" : "Preferred City *"}
              </label>
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!form.state}
                required
              >
                <option value="">Select city</option>
                {(cityOptions[form.state] || []).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <label htmlFor="locality">Area / Locality</label>
              <input
                id="locality"
                name="locality"
                value={form.locality}
                onChange={handleChange}
                placeholder="Enter area or locality"
              />

              {/* OWNER ADDRESS AND DOCUMENTS */}

              {isOwner && (
                <>
                  <label htmlFor="address">Full Property Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter complete property address"
                    rows={3}
                    required
                  />

                  <label htmlFor="pincode">PIN Code *</label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit PIN code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                  />

                  <label htmlFor="ownershipStatus">
                    Ownership Status
                  </label>
                  <select
                    id="ownershipStatus"
                    name="ownershipStatus"
                    value={form.ownershipStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select status</option>
                    <option value="Owner">Property Owner</option>
                    <option value="Authorized Representative">
                      Authorized Representative
                    </option>
                  </select>

                  <label htmlFor="listingUrl">
                    Existing Property Listing URL
                  </label>
                  <input
                    id="listingUrl"
                    name="listingUrl"
                    type="url"
                    value={form.listingUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  <label htmlFor="documentUrl">
                    Google Drive / Document URL
                  </label>
                  <input
                    id="documentUrl"
                    name="documentUrl"
                    type="url"
                    value={form.documentUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                  />

                  <label htmlFor="documents">
                    Property Documents
                  </label>
                  <input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFiles}
                  />

                  {files.length > 0 && (
                    <p className="register-file-list">
                      Selected:{" "}
                      {files.map((file) => file.name).join(", ")}
                    </p>
                  )}

                  <label htmlFor="description">
                    Property Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the property"
                    rows={4}
                  />
                </>
              )}

              {/* PURCHASE BUDGET */}

              {isPurchase && (
                <>
                  <label htmlFor="budget">
                    Purchase Budget (₹) *
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="1"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="Enter your purchase budget"
                    required
                  />
                </>
              )}

              {/* RENTAL BUDGET */}

              {isRental && (
                <>
                  <label htmlFor="budget">
                    Monthly Rent Budget (₹) *
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="1"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="Enter monthly budget"
                    required
                  />
                </>
              )}

              {/* SELLING OR RENT-OUT PRICE */}

              {form.intent === "SELL_PROPERTY" && (
                <>
                  <label htmlFor="price">
                    Expected Selling Price (₹) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter expected selling price"
                    required
                  />
                </>
              )}

              {[
                "RENT_OUT",
                "LEASE_OUT_COMMERCIAL",
              ].includes(form.intent) && (
                <>
                  <label htmlFor="price">
                    Expected Monthly Rent (₹) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter expected monthly rent"
                    required
                  />
                </>
              )}

              {/* BEDROOMS AND FURNISHING */}

              {isHome && (
                <>
                  <label htmlFor="bedrooms">Bedrooms</label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleChange}
                  >
                    <option value="">Select BHK</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5+">5+ BHK</option>
                  </select>

                  <label htmlFor="furnishing">Furnishing</label>
                  <select
                    id="furnishing"
                    name="furnishing"
                    value={form.furnishing}
                    onChange={handleChange}
                  >
                    <option value="">Select furnishing</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">
                      Semi-Furnished
                    </option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </>
              )}

              {/* PG / CO-LIVING */}

              {form.intent === "PG_COLIVING" && (
                <>
                  <label htmlFor="sharingPreference">
                    Room Preference
                  </label>
                  <select
                    id="sharingPreference"
                    name="sharingPreference"
                    value={form.sharingPreference}
                    onChange={handleChange}
                  >
                    <option value="">Select room preference</option>
                    <option value="Single">Single Room</option>
                    <option value="Double">Double Sharing</option>
                    <option value="Triple">Triple Sharing</option>
                    <option value="Any">Any</option>
                  </select>

                  <label htmlFor="mealsPreference">
                    Meals Preference
                  </label>
                  <select
                    id="mealsPreference"
                    name="mealsPreference"
                    value={form.mealsPreference}
                    onChange={handleChange}
                  >
                    <option value="">Select meals preference</option>
                    <option value="Included">Meals Included</option>
                    <option value="Not Included">Without Meals</option>
                    <option value="Any">Any</option>
                  </select>
                </>
              )}

              {/* LAND REQUIREMENTS */}

              {form.intent === "BUY_LAND" && (
                <>
                  <label htmlFor="landType">Land Type</label>
                  <select
                    id="landType"
                    name="landType"
                    value={form.landType}
                    onChange={handleChange}
                  >
                    <option value="">Select land type</option>
                    <option value="Residential">Residential</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>

                  <label htmlFor="intendedUse">Intended Use</label>
                  <select
                    id="intendedUse"
                    name="intendedUse"
                    value={form.intendedUse}
                    onChange={handleChange}
                  >
                    <option value="">Select intended use</option>
                    <option value="Build a Home">Build a Home</option>
                    <option value="Investment">Investment</option>
                    <option value="Business">Business</option>
                    <option value="Agriculture">Agriculture</option>
                  </select>
                </>
              )}

              {/* COMMERCIAL USE */}

              {isCommercial && (
                <>
                  <label htmlFor="intendedUse">
                    Intended Business Use
                  </label>
                  <input
                    id="intendedUse"
                    name="intendedUse"
                    value={form.intendedUse}
                    onChange={handleChange}
                    placeholder="e.g. Office, retail, warehouse"
                  />
                </>
              )}

              {/* PROPERTY AREA */}

              {[
                "BUY_LAND",
                "BUY_COMMERCIAL",
                "LEASE_COMMERCIAL",
                "SELL_PROPERTY",
                "RENT_OUT",
                "LEASE_OUT_COMMERCIAL",
              ].includes(form.intent) && (
                <>
                  <label htmlFor="propertySize">
                    Property Area (sq. ft.)
                  </label>
                  <input
                    id="propertySize"
                    name="propertySize"
                    type="number"
                    min="1"
                    value={form.propertySize}
                    onChange={handleChange}
                    placeholder="Enter property area"
                  />
                </>
              )}

              {/* LEASE DURATION */}

              {isLease && (
                <>
                  <label htmlFor="leaseDuration">
                    Lease Duration
                  </label>
                  <select
                    id="leaseDuration"
                    name="leaseDuration"
                    value={form.leaseDuration}
                    onChange={handleChange}
                  >
                    <option value="">Select lease duration</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </>
              )}

              {/* MOVE-IN DATE */}

              {[
                "RENT_HOME",
                "PG_COLIVING",
              ].includes(form.intent) && (
                <>
                  <label htmlFor="moveInDate">
                    Expected Move-in Date
                  </label>
                  <input
                    id="moveInDate"
                    name="moveInDate"
                    type="date"
                    value={form.moveInDate}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* AVAILABILITY DATE */}

              {[
                "RENT_OUT",
                "LEASE_OUT_COMMERCIAL",
              ].includes(form.intent) && (
                <>
                  <label htmlFor="availabilityDate">
                    Available From
                  </label>
                  <input
                    id="availabilityDate"
                    name="availabilityDate"
                    type="date"
                    value={form.availabilityDate}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* POSSESSION TIMELINE */}

              {[
                "BUY_HOME",
                "BUY_LAND",
                "BUY_COMMERCIAL",
              ].includes(form.intent) && (
                <>
                  <label htmlFor="possessionTimeline">
                    Expected Purchase Timeline
                  </label>
                  <select
                    id="possessionTimeline"
                    name="possessionTimeline"
                    value={form.possessionTimeline}
                    onChange={handleChange}
                  >
                    <option value="">Select timeline</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 3 Months">
                      Within 3 Months
                    </option>
                    <option value="Within 6 Months">
                      Within 6 Months
                    </option>
                    <option value="Just Exploring">
                      Just Exploring
                    </option>
                  </select>
                </>
              )}
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="alert">
            {message}
          </p>
        )}

        <p className="auth-signup">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>

        <p className="auth-footer">
          Property management, all in one place.
        </p>
      </div>
    </div>
  );
}
