"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore"

interface Payment {
  amount: number
  timestamp: string
}

interface PatientData {
  id?: string
  name: string
  age: string
  gender: string
  problem: string
  totalSessions: string
  totalFee: string
  payments: Payment[]
}

export default function DoctorDashboard() {
  const [formData, setFormData] = useState<PatientData>({
    name: "",
    age: "",
    gender: "",
    problem: "",
    totalSessions: "",
    totalFee: "",
    payments: [],
  })

  const [patients, setPatients] = useState<PatientData[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [pdfPatient, setPdfPatient] = useState<PatientData | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const querySnapshot = await getDocs(collection(db, "patients"))
    const patientsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PatientData[]
    setPatients(patientsData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (selectedPatientId) {
      await updateDoc(doc(db, "patients", selectedPatientId), formData)
    } else {
      await addDoc(collection(db, "patients"), formData)
    }
    fetchPatients()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      problem: "",
      totalSessions: "",
      totalFee: "",
      payments: [],
    })
    setSelectedPatientId(null)
    setPaymentAmount("")
  }

  const selectPatient = async (id: string) => {
    const docSnap = await getDoc(doc(db, "patients", id))
    if (docSnap.exists()) {
      setFormData(docSnap.data() as PatientData)
      setSelectedPatientId(id)
    }
  }

  const handleDelete = async () => {
    if (selectedPatientId) {
      await deleteDoc(doc(db, "patients", selectedPatientId))
      fetchPatients()
      resetForm()
    }
  }

  const handleAddPayment = async () => {
    if (!selectedPatientId || !paymentAmount) return

    const newPayment = {
      amount: Number(paymentAmount),
      timestamp: new Date().toLocaleString(),
    }

    const updatedPayments = [...(formData.payments || []), newPayment]
    const updatedData = { ...formData, payments: updatedPayments }

    await updateDoc(doc(db, "patients", selectedPatientId), updatedData)
    setFormData(updatedData)
    setPaymentAmount("")
  }

  const handleGeneratePDF = (patient: PatientData) => {
    setPdfPatient(patient)
  }

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPaid = formData.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const totalFee = Number(formData.totalFee || 0)
  const remaining = totalFee - totalPaid

  return (
    <div className="flex h-screen font-inter bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white border-r border-gray-200 px-6 py-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Patients</h2>
        <input
          type="text"
          placeholder="Search patients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <ul className="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
          {filteredPatients.map((p) => (
            <li
              key={p.id}
              className={`p-3 rounded-lg border flex justify-between items-center transition ${
                selectedPatientId === p.id
                  ? "bg-blue-100 border-blue-400 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              <span onClick={() => selectPatient(p.id!)} className="cursor-pointer flex-1">
                {p.name}
              </span>
              <button
                onClick={() => handleGeneratePDF(p)}
                className="text-sm text-blue-600 underline ml-4 hover:text-blue-800"
              >
                Generate PDF
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-8 overflow-y-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">
          {selectedPatientId ? "Edit Patient" : "Add New Patient"}
        </h2>

        <div className="grid grid-cols-2 gap-5 mb-8">
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="p-3 border rounded-lg shadow-sm" />
          <input name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="p-3 border rounded-lg shadow-sm" />
          <select name="gender" value={formData.gender} onChange={handleChange} className="p-3 border rounded-lg shadow-sm">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input name="problem" placeholder="Health Problem" value={formData.problem} onChange={handleChange} className="p-3 border rounded-lg shadow-sm" />
          <input name="totalSessions" placeholder="Total Sessions" value={formData.totalSessions} onChange={handleChange} className="p-3 border rounded-lg shadow-sm" />
          <input name="totalFee" placeholder="Total Fee (₹)" value={formData.totalFee} onChange={handleChange} className="p-3 border rounded-lg shadow-sm" />
        </div>

        <div className="mb-8 flex gap-4">
          <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {selectedPatientId ? "Update" : "Add Patient"}
          </button>
          {selectedPatientId && (
            <button onClick={handleDelete} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Delete
            </button>
          )}
        </div>

        {/* Payment Section */}
        {selectedPatientId && (
          <section className="bg-white/70 backdrop-blur-md border border-gray-200 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Details</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-500 text-sm">Total Fee</p>
                <p className="text-lg font-semibold text-gray-700">₹{totalFee}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Paid</p>
                <p className="text-lg font-semibold text-green-600">₹{totalPaid}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Remaining</p>
                <p className="text-lg font-semibold text-red-500">₹{remaining}</p>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <input
                type="number"
                placeholder="Enter payment"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="p-3 border rounded-lg w-1/2"
              />
              <button onClick={handleAddPayment} className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Add Payment
              </button>
            </div>

            <h4 className="text-md font-medium mb-2 text-gray-800">Payment History</h4>
            <ul className="space-y-2 text-sm text-gray-700 max-h-[200px] overflow-y-auto pr-2">
              {formData.payments?.map((p, idx) => (
                <li key={idx} className="flex justify-between border-b py-2">
                  <span>₹{p.amount}</span>
                  <span className="text-gray-500">{p.timestamp}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* PDF Modal Preview */}
   {/* PDF Modal Preview */} 
{pdfPatient && (
  <div className="fixed inset-0 bg-white z-50 overflow-auto print:overflow-visible print:p-0">
    <div className="relative w-[794px] min-h-[1123px] mx-auto bg-white px-[40px] py-[40px] text-sm leading-tight shadow-none print:shadow-none print:w-[794px] print:min-h-[1123px] print:px-[40px] print:py-[40px] flex flex-col justify-between print:h-auto">

      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[60px] text-gray-300 font-bold opacity-10 rotate-12 pointer-events-none select-none z-0">
        Doctor Active Plus
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col gap-6 flex-grow">
        {/* Header */}
        <div className="flex items-center gap-4 pb-3 border-b border-gray-300">
          <img src="/dap-icon.jpeg" alt="Clinic Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Active Plus</h1>
            <p className="text-gray-600 text-sm">Advance Spine | Joint & Laser Center</p>
            <p className="text-gray-500 text-xs">Above Bommanahalli Milk Producers' Cooperative Society</p>
<p className="text-gray-500 text-xs">Bommanahalli Main Road,
Bommanahalli,</p><p className="text-gray-500 text-xs"> Bengaluru – 560049,
Karnataka</p>
            <p className="text-gray-500 text-xs">Email: drmovementrx@gmail.com | +91-9262727272</p>
          </div>
        </div>

        {/* Info Header */}
        <div className="flex justify-between items-center text-xs text-gray-600">
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          
        </div>

        {/* Patient Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Patient Information</h2>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {pdfPatient.name}</p>
            <p><strong>Age:</strong> {pdfPatient.age}</p>
            <p><strong>Gender:</strong> {pdfPatient.gender}</p>
            <p><strong>Health Concern:</strong> {pdfPatient.problem}</p>
            <p><strong>Planned Sessions:</strong> {pdfPatient.totalSessions}</p>
            
          </div>
        </div>

        {/* Payment Summary */}
        <div>
  <h2 className="text-lg font-semibold text-gray-700 mb-2 text-left">Payment Summary</h2>
  <ul className="text-xs space-y-1 text-left">
    {pdfPatient.payments?.map((p, i) => (
      <li
        key={i}
        className="flex justify-between border-b border-dashed border-gray-200 pb-1"
      >
        <span>₹{p.amount}</span>
        <span className="text-gray-500">{p.timestamp}</span>
      </li>
    ))}
  </ul>
  <hr className="my-2 border-gray-300" />
  <p className="text-left font-medium text-sm text-gray-800">
    Total Paid: ₹{pdfPatient.payments?.reduce((sum, p) => sum + p.amount, 0)}
  </p>
</div>

{/* Signature */}
<div className="text-left mt-4">
  <p className="mb-1 text-sm">________________________</p>
  <p className="text-xs text-gray-700">Dr. Anil Kumar</p>
  <p className="text-[10px] text-gray-500">Senior Physiotherapist</p>
</div>


        {/* Footer */}
        <div className="text-center text-[10px] text-gray-500 leading-tight mt-4">
          Note: All services are provided under the supervision of qualified medical professionals. Results may vary from person to person. <br />
          We will do the best. Package treatment must be completed in given time period. <br />
          (Package treatment fee will not be refunded under any circumstances.)
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-center gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => setPdfPatient(null)}
          className="text-red-600 hover:underline text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}







    </div>
  )
}
