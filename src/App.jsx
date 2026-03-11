import { useState } from "react"
import "./App.css"

const BASE_URL = "http://localhost:8000/api"

function App() {
  const [aadhaar, setAadhaar] = useState("")
  const [citizen, setCitizen] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  /* ================= COMMON DOWNLOAD FUNCTION ================= */

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url)

      if (!response.ok)
        throw new Error("Failed to generate PDF")

      const blob = await response.blob()

      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert(err.message)
    }
  }

  /* ================= INDIVIDUAL PDF ================= */

  const downloadPDF = async () => {
    if (!aadhaar) {
      alert("Search citizen first")
      return
    }

    downloadFile(
      `${BASE_URL}/citizen/${aadhaar}/pdf/`,
      `Citizen_${aadhaar}.pdf`
    )
  }

  /* ================= FAMILY PDF ================= */

  const downloadFamilyPDF = async () => {
    if (!aadhaar) {
      alert("Search citizen first")
      return
    }

    downloadFile(
      `${BASE_URL}/fam/${aadhaar}/pdf/`,
      `Family_${aadhaar}.pdf`
    )
  }

  /* ================= FORM STATE ================= */

  const [formData, setFormData] = useState({
    aadhaar_card: "",
    name: "",
    relation_type: "",
    relation_aadhaar: "",
    ward: "",
    gpu: "",
    district: "",
    coi: "",
    voter_id: "",
    bank_number: "",
    contact_no: "",
    qualification: "",
    profession: "",
    home_category: "",
    professional_details: "",
    land_details: "",
    schemes_applied: "",
    health_status: "",
  })

  /* ================= FETCH ================= */

  const fetchCitizen = async () => {
    setError("")
    setCitizen(null)

    if (!aadhaar) {
      setError("Please enter Aadhaar number")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/get/${aadhaar}/`)
      if (!res.ok) throw new Error("Citizen not found")

      const data = await res.json()
      setCitizen(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ================= FORM ================= */

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const submitCitizen = async () => {
    setError("")

    try {
      const res = await fetch(`${BASE_URL}/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to add citizen")

      alert("Citizen added successfully ✅")
      setShowAddForm(false)

      const cleared = {}
      Object.keys(formData).forEach((k) => (cleared[k] = ""))
      setFormData(cleared)
    } catch (err) {
      setError(err.message)
    }
  }

  /* ================= RELATION OPTIONS ================= */

  const relationOptions = [
    { value: "", label: "Select Relation Type" },
    { value: "HEAD", label: "Head of Family" },
    { value: "SO", label: "S/O" },
    { value: "DO", label: "D/O" },
    { value: "WO", label: "W/O" },
  ]

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Citizen Information Portal</h1>

      <div className="layout">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="card">
            <label className="label">Aadhaar Number</label>

            <div className="search-row">
              <input
                className="input"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                placeholder="Enter 12-digit Aadhaar"
              />

              <button
                className="btn btn-primary"
                onClick={fetchCitizen}
              >
                Search
              </button>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              ➕ Add Citizen
            </button>

            {loading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">

          {/* ADD FORM */}
          {showAddForm && (
            <div className="card">
              <h2>Add Citizen Details</h2>

              <div className="form-grid">
                {Object.entries(formData).map(([key, value]) => {

                  if (key === "relation_type") {
                    return (
                      <select
                        key={key}
                        name="relation_type"
                        value={value}
                        onChange={handleChange}
                        className="input"
                      >
                        {relationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )
                  }

                  if (key === "relation_aadhaar") {
                    return (
                      <input
                        key={key}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        placeholder="Relation Aadhaar"
                        className="input"
                        disabled={formData.relation_type === "HEAD"}
                      />
                    )
                  }

                  return (
                    <input
                      key={key}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      placeholder={key.replace(/_/g, " ")}
                      className="input"
                    />
                  )
                })}
              </div>

              <button
                className="btn btn-success submit-btn"
                onClick={submitCitizen}
              >
                Submit
              </button>
            </div>
          )}

          {/* CITIZEN DATA */}
          {citizen && (
            <div className="card">

              {/* BUTTON GROUP */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "15px",
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={downloadPDF}
                >
                  📄 Download Individual PDF
                </button>

                <button
                  className="btn btn-outline"
                  onClick={downloadFamilyPDF}
                >
                  👨‍👩‍👧 Download Family Details
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <tbody>
                    {Object.entries(citizen).map(([key, value]) => (
                      <TableRow key={key} label={key} value={value} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function TableRow({ label, value }) {
  return (
    <tr>
      <td className="label-cell">
        {label.replace(/_/g, " ")}
      </td>
      <td>{value || "-"}</td>
    </tr>
  )
}

export default App