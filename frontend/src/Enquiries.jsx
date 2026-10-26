import { useState } from "react";
import "./Enquiries.css";

const API = `${
  import.meta.env.VITE_API_URL || "http://localhost:8080"
}/api`;

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  enquiryType: "BUY",
  propertyName: "",
  message: "",
};

export default function Enquiries() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    setLoading(true);

    try {
      const response = await fetch(`${API}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Unable to submit enquiry (${response.status})`
        );
      }

      setFeedback({
        type: "success",
        message:
          "Thank you! Your enquiry has been submitted successfully.",
      });

      setForm(initialForm);
    } catch (error) {
      console.error("Enquiry submission failed:", error);

      setFeedback({
        type: "error",
        message:
          "We couldn't submit your enquiry. Please check the backend connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="enquiry-page">
      <section className="enquiry-banner">
        <div className="enquiry-brand">
          <div className="enquiry-brand-icon">
            <span>H</span>
          </div>

          <div>
            <h2>HomeSpace</h2>
            <p>Property Management</p>
          </div>
        </div>

        <div className="enquiry-banner-content">
          <span className="enquiry-eyebrow">
            YOUR PROPERTY JOURNEY STARTS HERE
          </span>

          <h1>Your next chapter starts here.</h1>

          <p>
            Tell us what you are looking for. Our team will help
            you find the right property for your needs.
          </p>

          <div className="enquiry-trust">
            <span>✓</span>
            Personalized property assistance
          </div>
        </div>

        <div className="enquiry-banner-decoration" aria-hidden="true">
          <span className="decoration-house">⌂</span>
          <span className="decoration-circle" />
        </div>
      </section>

      <section className="enquiry-form-card">
        <div className="enquiry-form-heading">
          <div className="enquiry-heading-icon">
            <span>✉</span>
          </div>

          <div>
            <h2>Send us an enquiry</h2>
            <p>
              Share your requirements and let us help you find
              your perfect property.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="enquiry-form-grid">
            <div className="enquiry-field">
              <label htmlFor="enquiry-name">Full name *</label>
              <input
                id="enquiry-name"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            <div className="enquiry-field">
              <label htmlFor="enquiry-phone">Phone number *</label>
              <input
                id="enquiry-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                maxLength={20}
                autoComplete="tel"
                required
              />
            </div>

            <div className="enquiry-field enquiry-full-width">
              <label htmlFor="enquiry-email">Email address *</label>
              <input
                id="enquiry-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                maxLength={150}
                autoComplete="email"
                required
              />
            </div>

            <div className="enquiry-field enquiry-full-width">
              <label>What are you interested in? *</label>

              <div className="enquiry-type-options">
                {[
                  { value: "BUY", label: "Buy", icon: "⌂" },
                  { value: "RENT", label: "Rent", icon: "⌑" },
                  {
                    value: "COMMERCIAL",
                    label: "Commercial",
                    icon: "▦",
                  },
                  {
                    value: "PG",
                    label: "PG / Co-living",
                    icon: "▤",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`enquiry-type-option ${
                      form.enquiryType === option.value
                        ? "selected"
                        : ""
                    }`}
                    aria-pressed={
                      form.enquiryType === option.value
                    }
                    onClick={() =>
                      updateField("enquiryType", option.value)
                    }
                  >
                    <span className="enquiry-option-icon">
                      {option.icon}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="enquiry-field enquiry-full-width">
              <label htmlFor="enquiry-property">
                Property name <span>(optional)</span>
              </label>
              <input
                id="enquiry-property"
                type="text"
                placeholder="Which property caught your eye?"
                value={form.propertyName}
                onChange={(event) =>
                  updateField("propertyName", event.target.value)
                }
                maxLength={200}
              />
            </div>

            <div className="enquiry-field enquiry-full-width">
              <label htmlFor="enquiry-message">Your message *</label>
              <textarea
                id="enquiry-message"
                placeholder="Tell us about your preferred location, budget, or requirements..."
                value={form.message}
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
                rows={4}
                maxLength={2000}
                required
              />
              <span className="enquiry-character-count">
                {form.message.length}/2000
              </span>
            </div>
          </div>

          {feedback.message && (
            <div
              className={`enquiry-feedback ${feedback.type}`}
              role="status"
            >
              {feedback.message}
            </div>
          )}

          <div className="enquiry-form-footer">
            <p>
              <span>🔒</span> Your information will be handled
              securely.
            </p>

            <button
              type="submit"
              className="enquiry-submit-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Send Enquiry"}
              {!loading && <span> →</span>}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
