import { useState } from "react"

function App() {
  const [aadhaar, setAadhaar] = useState("")
  const [citizen, setCitizen] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    aadhaar_card: "",
    name: "",
    relation_name: "",
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

  const fetchCitizen = async () => {
    setError("")
    setCitizen(null)

    if (!aadhaar) {
      setError("Please enter Aadhaar number")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `https://pro-back-flsb.onrender.com/api/get/${aadhaar}/`
      )

      if (!res.ok) throw new Error("Citizen not found")

      const data = await res.json()
      setCitizen(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const submitCitizen = async () => {
    setError("")
    try {
      const res = await fetch("https://pro-back-flsb.onrender.com/api/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to add citizen")

      alert("Citizen added successfully ✅")
      setShowAddForm(false)
      setFormData({})
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-8">
          Citizen Information Portal
        </h1>

        {/* Search + Add */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
          <label className="block text-sm font-medium mb-2">
            Aadhaar Number
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              placeholder="Enter 12-digit Aadhaar"
              className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={fetchCitizen}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
          >
            ➕ Add Citizen
          </button>

          {loading && <p className="text-blue-600 mt-4 text-center">Loading...</p>}
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add Citizen Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(formData).map((key) => (
                <input
                  key={key}
                  name={key}
                  placeholder={key.replace(/_/g, " ")}
                  value={formData[key] || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              ))}
            </div>

            <button
              onClick={submitCitizen}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        )}

        {/* Citizen Table */}
        {citizen && (
          <div className="mt-10 bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <tbody>
                {Object.entries(citizen).map(([key, value]) => (
                  <TableRow key={key} label={key} value={value} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TableRow({ label, value }) {
  return (
    <tr className="border-b">
      <td className="bg-gray-50 px-4 py-2 font-medium text-sm w-1/3">
        {label.replace(/_/g, " ")}
      </td>
      <td className="px-4 py-2 text-sm">{value || "-"}</td>
    </tr>
  )
}

export default App
