
import { useMemo, useState } from "react";
import "./Reports.css";

const PROPERTY_STATUSES = ["Available", "Occupied", "Rented", "Sold"];
const ENQUIRY_STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];
const VISIT_STATUSES = ["Scheduled", "Completed", "Cancelled"];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getText(value) {
  return String(value ?? "").trim();
}

function getStatus(record) {
  return getText(record?.status || "Pending")
    .replaceAll("_", " ")
    .toLowerCase();
}

function getDate(record, fields) {
  for (const field of fields) {
    const value = record?.[field];

    if (value) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function matchesDateRange(record, fromDate, toDate, dateFields) {
  const date = getDate(record, dateFields);

  // Keep records with no date when no date filter is selected.
  if (!fromDate && !toDate) {
    return true;
  }

  // A date-filtered report cannot reliably include undated records.
  if (!date) {
    return false;
  }

  const recordDay = date.toISOString().slice(0, 10);

  if (fromDate && recordDay < fromDate) {
    return false;
  }

  if (toDate && recordDay > toDate) {
    return false;
  }

  return true;
}

function getPropertyType(property) {
  return getText(
    property?.propertyType ||
    property?.type ||
    property?.category ||
    "Other"
  );
}

function getPropertyStatus(property) {
  return getStatus(property);
}

function getEnquiryStatus(enquiry) {
  const status = getStatus(enquiry);

  if (status === "in progress" || status === "in-progress") {
    return "In Progress";
  }

  if (status === "resolved") return "Resolved";
  if (status === "rejected") return "Rejected";

  return "Pending";
}

function getVisitStatus(visit) {
  const status = getStatus(visit);

  if (status === "completed") return "Completed";
  if (status === "cancelled" || status === "canceled") {
    return "Cancelled";
  }

  return "Scheduled";
}

function getPropertyName(property) {
  return getText(
    property?.propertyName ||
    property?.name ||
    property?.title ||
    property?.address ||
    "Unnamed property"
  );
}

function getEnquiryName(enquiry) {
  return getText(
    enquiry?.fullName ||
    enquiry?.name ||
    enquiry?.customerName ||
    enquiry?.visitorName ||
    "Unknown"
  );
}

function countBy(items, getLabel) {
  const counts = {};

  items.forEach((item) => {
    const label = getLabel(item);
    counts[label] = (counts[label] || 0) + 1;
  });

  return counts;
}


            function DonutChart({ title, items }) {
            const total = items.reduce(
                (sum, item) => sum + item.value,
                0
            );

            const colors = [
                "#4385f5",
                "#35c98b",
                "#ffbd35",
                "#8b5cf6",
                "#fa596b",
            ];

            const segments = items.reduce((result, item, index) => {
                const start =
                result.length > 0
                    ? result[result.length - 1].end
                    : 0;

                const angle = total > 0 ? (item.value / total) * 360 : 0;

                result.push({
                ...item,
                color: colors[index % colors.length],
                start,
                end: start + angle,
                });

                return result;
            }, []);

            const gradient =
                total > 0
                ? `conic-gradient(${segments
                    .map(
                        (segment) =>
                        `${segment.color} ${segment.start}deg ${segment.end}deg`
                    )
                    .join(", ")})`
                : "#e9eef5";

            return (
            <article className="reports-card">
                <h2>{title}</h2>

                <div className="reports-donut-layout">
                <div
                    className="reports-donut"
                    style={{ background: gradient }}
                    role="img"
                    aria-label={`${title}: ${total} records`}
                >
                    <div className="reports-donut-hole">
                    <strong>{total}</strong>
                    <span>Records</span>
                    </div>
                </div>

                <div className="reports-legend">
                    {segments.map((segment, index) => (
                    <div className="reports-legend-item" key={`${segment.label}-${index}`}>
                        <span
                        className="reports-legend-dot"
                        style={{ backgroundColor: segment.color }}
                        />
                        <span className="reports-legend-label">{segment.label}</span>
                        <strong>{segment.value}</strong>
                    </div>
                    ))}
                </div>
                </div>
            </article>
            );
}



function BarChart({ title, items }) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  const colors = ["#4385f5", "#31c48d", "#ffbd3e", "#f45b69"];

  return (
    <article className="reports-card">
      <h2>{title}</h2>

      <div className="reports-bar-chart">
        {items.map((item, index) => (
          <div className="reports-bar-column" key={item.label}>
            <strong className="reports-bar-value">{item.value}</strong>

            <div className="reports-bar-track">
              <div
                className="reports-bar"
                style={{
                  height:
                    item.value === 0
                      ? "0%"
                      : `${Math.max(5, (item.value / maxValue) * 100)}%`,
                  backgroundColor: colors[index % colors.length],
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>

            <span className="reports-bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function TrendChart({ title, labels, values, color = "#4385f5" }) {
  const width = 440;
  const height = 205;
  const left = 30;
  const right = 15;
  const top = 22;
  const bottom = 38;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(1, ...values);

  const points = values.map((value, index) => {
    const x =
      left +
      (values.length > 1 ? (index / (values.length - 1)) * plotWidth : plotWidth / 2);

    const y = top + plotHeight - (value / maxValue) * plotHeight;

    return { x, y, value, label: labels[index] };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  const areaPoints = [
    `${left},${top + plotHeight}`,
    linePoints,
    `${left + plotWidth},${top + plotHeight}`,
  ].join(" ");

  return (
    <article className="reports-card">
      <h2>{title}</h2>

      <div className="reports-trend-chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title}
        >
          {[0, 1, 2, 3, 4].map((step) => {
            const y = top + (plotHeight / 4) * step;

            return (
              <g key={step}>
                <line
                  x1={left}
                  y1={y}
                  x2={left + plotWidth}
                  y2={y}
                  stroke="#e7edf5"
                  strokeWidth="1"
                />
                <text
                  x={left - 7}
                  y={y + 4}
                  textAnchor="end"
                  fill="#7c8ba2"
                  fontSize="10"
                >
                  {Math.round(maxValue * (4 - step) / 4)}
                </text>
              </g>
            );
          })}

          <polygon
            points={areaPoints}
            fill={color}
            fillOpacity="0.1"
          />

          <polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={color}
              />
              <text
                x={point.x}
                y={height - 13}
                textAnchor="middle"
                fill="#71819b"
                fontSize="10"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </article>
  );
}

function buildMonthlyTrend(records, dateFields) {
  const now = new Date();
  const months = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - offset,
      1
    );

    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: MONTH_NAMES[date.getMonth()],
      value: 0,
    });
  }

  records.forEach((record) => {
    const date = getDate(record, dateFields);

    if (!date) return;

    const month = months.find(
      (item) =>
        item.year === date.getFullYear() &&
        item.month === date.getMonth()
    );

    if (month) month.value += 1;
  });

  return {
    labels: months.map((month) => month.label),
    values: months.map((month) => month.value),
  };
}

export default function Reports({
  properties = [],
  owners = [],
  tenants = [],
  enquiries = [],
  siteVisits = [],
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
    state: "",
    city: "",
    type: "",
  });

  console.log("Properties received:", properties);
  console.log("State values:", properties.map((property) => property.state));

  const states = useMemo(() => {
    return [
      ...new Set(
        properties
          .map((property) => getText(property.state))
          .filter(Boolean)
      ),
    ].sort();
  }, [properties]);

  const cities = useMemo(() => {
    return [
      ...new Set(
        properties
          .filter(
            (property) =>
              !selectedState ||
              getText(property.state) === selectedState
          )
          .map((property) => getText(property.city))
          .filter(Boolean)
      ),
    ].sort();
  }, [properties, selectedState]);

  const propertyTypes = useMemo(() => {
    return [
      ...new Set(properties.map(getPropertyType)),
    ].sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const stateMatches =
        !appliedFilters.state ||
        getText(property.state) === appliedFilters.state;

      const cityMatches =
        !appliedFilters.city ||
        getText(property.city) === appliedFilters.city;

      const typeMatches =
        !appliedFilters.type ||
        getPropertyType(property).toLowerCase() ===
          appliedFilters.type.toLowerCase();

      return stateMatches && cityMatches && typeMatches;
    });
  }, [properties, appliedFilters]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) =>
      matchesDateRange(
        enquiry,
        appliedFilters.fromDate,
        appliedFilters.toDate,
        ["createdAt", "createdDate", "enquiryDate", "date"]
      )
    );
  }, [enquiries, appliedFilters]);

  const filteredVisits = useMemo(() => {
    return siteVisits.filter((visit) =>
      matchesDateRange(
        visit,
        appliedFilters.fromDate,
        appliedFilters.toDate,
        ["visitDate", "createdAt", "date"]
      )
    );
  }, [siteVisits, appliedFilters]);

  const typeCounts = useMemo(
    () => countBy(filteredProperties, getPropertyType),
    [filteredProperties]
  );

  const propertyStatusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      PROPERTY_STATUSES.map((status) => [status, 0])
    );

    filteredProperties.forEach((property) => {
      const status = getPropertyStatus(property);
      const matchingStatus = PROPERTY_STATUSES.find(
        (item) => item.toLowerCase() === status
      );

      if (matchingStatus) counts[matchingStatus] += 1;
    });

    return counts;
  }, [filteredProperties]);

  const enquiryStatusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      ENQUIRY_STATUSES.map((status) => [status, 0])
    );

    filteredEnquiries.forEach((enquiry) => {
      counts[getEnquiryStatus(enquiry)] += 1;
    });

    return counts;
  }, [filteredEnquiries]);

  const visitStatusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      VISIT_STATUSES.map((status) => [status, 0])
    );

    filteredVisits.forEach((visit) => {
      counts[getVisitStatus(visit)] += 1;
    });

    return counts;
  }, [filteredVisits]);

  const enquiryTrend = useMemo(
    () =>
      buildMonthlyTrend(enquiries, [
        "createdAt",
        "createdDate",
        "enquiryDate",
        "date",
      ]),
    [enquiries]
  );

  const visitTrend = useMemo(
    () => buildMonthlyTrend(siteVisits, ["visitDate", "createdAt", "date"]),
    [siteVisits]
  );

  const recentEnquiries = useMemo(() => {
    return [...filteredEnquiries]
      .sort((a, b) => {
        const dateA = getDate(a, ["createdAt", "createdDate", "enquiryDate"]);
        const dateB = getDate(b, ["createdAt", "createdDate", "enquiryDate"]);

        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, 5);
  }, [filteredEnquiries]);

  function applyFilters(event) {
    event.preventDefault();

    setAppliedFilters({
      fromDate,
      toDate,
      state: selectedState,
      city: selectedCity,
      type: selectedType,
    });
  }

  function resetFilters() {
    setFromDate("");
    setToDate("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedType("");

    setAppliedFilters({
      fromDate: "",
      toDate: "",
      state: "",
      city: "",
      type: "",
    });
  }

  return (
    <section className="reports-page">
      <div className="reports-intro">
        <span className="reports-eyebrow">PROPERTY MANAGEMENT</span>
        <p>View your property activity and performance in one place.</p>
      </div>

      <form className="reports-filters" onSubmit={applyFilters}>
        <label>
          From date
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>

        <label>
          To date
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>

        <label>
          State
          <select
            value={selectedState}
            onChange={(event) => {
              setSelectedState(event.target.value);
              setSelectedCity("");
            }}
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option value={state} key={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label>
          City
          <select
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option value={city} key={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label>
          Property type
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value="">All Property Types</option>
            {propertyTypes.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <div className="reports-filter-actions">
          <button className="reports-button" type="submit">
            Apply
          </button>
          <button
            className="reports-button reports-button-secondary"
            type="button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="reports-summary-grid">
        <article className="reports-summary-card">
          <div className="reports-summary-icon reports-icon-blue">⌂</div>
          <div>
            <span>Total Properties</span>
            <strong>{filteredProperties.length}</strong>
            <small>Matching your filters</small>
          </div>
        </article>

        <article className="reports-summary-card">
          <div className="reports-summary-icon reports-icon-green">♙</div>
          <div>
            <span>Total Owners</span>
            <strong>{owners.length}</strong>
            <small>Registered owners</small>
          </div>
        </article>

        <article className="reports-summary-card">
          <div className="reports-summary-icon reports-icon-purple">▤</div>
          <div>
            <span>Total Enquiries</span>
            <strong>{filteredEnquiries.length}</strong>
            <small>Within selected dates</small>
          </div>
        </article>

        <article className="reports-summary-card">
          <div className="reports-summary-icon reports-icon-orange">▦</div>
          <div>
            <span>Total Site Visits</span>
            <strong>{filteredVisits.length}</strong>
            <small>Within selected dates</small>
          </div>
        </article>
      </div>

      <div className="reports-chart-grid">
        <DonutChart
          title="Properties by Type"
          items={Object.entries(typeCounts).map(([label, value]) => ({
            label,
            value,
          }))}
        />

        <DonutChart
          title="Property Status"
          items={PROPERTY_STATUSES.map((label) => ({
            label,
            value: propertyStatusCounts[label],
          }))}
        />

        <BarChart
          title="Enquiry Status"
          items={ENQUIRY_STATUSES.map((label) => ({
            label,
            value: enquiryStatusCounts[label],
          }))}
        />

        <BarChart
          title="Site Visit Status"
          items={VISIT_STATUSES.map((label) => ({
            label,
            value: visitStatusCounts[label],
          }))}
        />

        <TrendChart
          title="Monthly Enquiries Trend"
          labels={enquiryTrend.labels}
          values={enquiryTrend.values}
        />

        <TrendChart
          title="Site Visits Trend"
          labels={visitTrend.labels}
          values={visitTrend.values}
          color="#8b5cf6"
        />
      </div>

      <div className="reports-bottom-grid">
        <article className="reports-card">
          <h2>Tenant Overview</h2>

          <div className="reports-overview-row">
            <span>Registered tenants</span>
            <strong>{tenants.length}</strong>
          </div>

          <div className="reports-overview-row">
            <span>Properties listed</span>
            <strong>{filteredProperties.length}</strong>
          </div>

          <div className="reports-overview-row">
            <span>Open enquiries</span>
            <strong>
              {enquiryStatusCounts.Pending +
                enquiryStatusCounts["In Progress"]}
            </strong>
          </div>
        </article>

        <article className="reports-card">
          <h2>Report Summary</h2>

          <p className="reports-summary-text">
            There are {filteredProperties.length} properties matching your
            selected property filters, {owners.length} registered owners,
            {` ${filteredEnquiries.length} enquiries `}and{" "}
            {filteredVisits.length} site visits within the selected date range.
          </p>

          <div className="reports-summary-note">
            Reports reflect the records currently available to this page.
          </div>
        </article>
      </div>

      <article className="reports-card reports-recent-section">
        <div className="reports-section-heading">
          <div>
            <h2>Recent Enquiries</h2>
            <p>Latest enquiries within your selected date range.</p>
          </div>
          <span className="reports-count-badge">
            {filteredEnquiries.length} total
          </span>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="reports-empty-state">
            No enquiries found for the selected filters.
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Property</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentEnquiries.map((enquiry, index) => {
                  const date = getDate(enquiry, [
                    "createdAt",
                    "createdDate",
                    "enquiryDate",
                    "date",
                  ]);

                  const status = getEnquiryStatus(enquiry);

                  return (
                    <tr key={enquiry.id ?? index}>
                      <td>{getEnquiryName(enquiry)}</td>
                      <td>
                        {getText(
                          enquiry.propertyName ||
                          getPropertyName(enquiry.property)
                        ) || "—"}
                      </td>
                      <td>
                        {date ? date.toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td>
                        <span
                          className={`reports-status reports-status-${status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
