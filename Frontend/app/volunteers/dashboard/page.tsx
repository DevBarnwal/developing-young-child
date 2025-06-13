// // // app/volunteers/dashboard/page.tsx
// // import React from "react";
// // import StatCard from "@/components/StatCard";
// // import AssignedChildCard from "@/components/AssignedChildCard";

// // const VolunteerDashboardPage = () => {
// //   // ✅ Inline mock data for quick dev
// //   const assignedChildren = [
// //     { name: "Ravi", age: 3 },
// //     { name: "Meena", age: 2 },
// //     { name: "Arjun", age: 4 },
// //   ];

// //   return (
// //     <main className="min-h-screen bg-gradient-to-b from-[#FFE9C8] to-[#FFF3E5] px-6 py-8">
// //       <h1 className="text-3xl font-bold text-black mb-6">
// //         👩‍👧 Volunteer Dashboard
// //       </h1>

// //       <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// //         <StatCard title="Children Assigned" value={assignedChildren.length} />
// //         <StatCard title="Visits Logged" value="12" />
// //         <StatCard title="Flags Raised" value="1" />
// //       </section>

// //       <section className="bg-white rounded-xl p-6 shadow-md">
// //         <h2 className="text-xl font-semibold mb-4 text-black">Assigned Children</h2>
// //         <ul className="space-y-3">
// //           {assignedChildren.map((child, idx) => (
// //             <AssignedChildCard key={idx} child={child} />
// //           ))}
// //         </ul>
// //       </section>
// //     </main>
// //   );
// // };


// // Dashboard home with theme, font, and volunteer challenge-based UI
// 'use client'

// import Link from 'next/link'
// import { useState } from 'react'

// const childrenData = [
//   { id: 1, name: 'Riya Sharma', age: 4, status: 'Active', area: 'Pune East' },
//   { id: 2, name: 'Aarav Patil', age: 3, status: 'Flagged', area: 'Pune West' },
//   { id: 3, name: 'Meera Joshi', age: 5, status: 'Active', area: 'Pune East' },
// ]

// const areas = ['All', 'Pune East', 'Pune West']

// export default function VolunteerDashboard() {
//   const [selectedArea, setSelectedArea] = useState('All')

//   const filteredChildren = childrenData.filter(
//     (child) => selectedArea === 'All' || child.area === selectedArea
//   )

//   return (
//     <div className="min-h-screen bg-[#fff7ed] text-gray-800 font-sans">
//       <header className="bg-white shadow p-4 flex justify-between items-center">
//         <h1 className="text-2xl font-extrabold text-[#222]">Volunteer Dashboard</h1>
//         <span className="text-[#fbbf24] font-semibold">SpacECE India Foundation</span>
//       </header>

//       <main className="p-8">
//         <section className="mb-8">
//           <h2 className="text-xl font-bold mb-4">Assigned Children</h2>
//           <label className="block mb-2 font-medium text-gray-700">Filter by Area:</label>
//           <select
//             className="border border-gray-300 p-2 rounded"
//             value={selectedArea}
//             onChange={(e) => setSelectedArea(e.target.value)}
//           >
//             {areas.map((area) => (
//               <option key={area}>{area}</option>
//             ))}
//           </select>
//         </section>

//         <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
//           {filteredChildren.map((child) => (
//             <Link
//               href={`/volunteer/child/${child.id}`}
//               key={child.id}
//               className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-all border-l-4 border-[#fbbf24]"
//             >
//               <h3 className="text-xl font-semibold mb-2">{child.name}</h3>
//               <p>Age: {child.age}</p>
//               <p>Status: <span className={child.status === 'Flagged' ? 'text-red-600' : 'text-green-600'}>{child.status}</span></p>
//               <p>Area: {child.area}</p>
//             </Link>
//           ))}
//         </div>
//       </main>

//       <footer className="bg-[#fbbf24] text-white mt-12 p-6">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
//           <div>
//             <h4 className="font-semibold text-lg mb-2">Navigation</h4>
//             <ul className="space-y-1">
//               <li>About Us</li>
//               <li>Registration</li>
//               <li>Fellowship</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold text-lg mb-2">Quick Links</h4>
//             <ul className="space-y-1">
//               <li>Privacy Policy</li>
//               <li>Terms</li>
//               <li>Support</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold text-lg mb-2">Connect</h4>
//             <ul className="flex space-x-3">
//               <li>🌐</li>
//               <li>📧</li>
//               <li>📱</li>
//             </ul>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

// /app/volunteer/dashboard/page.tsx
// ----------------------------------
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function VolunteerDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const children = [
    { id: 1, name: 'Riya Sharma', age: 4, parent: 'Seema Sharma', status: 'active', lastVisit: '2024-03-15' },
    { id: 2, name: 'Arjun Patel', age: 5, parent: 'Priya Patel', status: 'flagged', lastVisit: '2024-03-14' },
    { id: 3, name: 'Zara Khan', age: 3, parent: 'Ayesha Khan', status: 'active', lastVisit: '2024-03-13' },
    { id: 4, name: 'Vihaan Reddy', age: 4, parent: 'Sneha Reddy', status: 'active', lastVisit: '2024-03-12' },
    { id: 5, name: 'Ananya Gupta', age: 5, parent: 'Ritu Gupta', status: 'flagged', lastVisit: '2024-03-11' },
    { id: 6, name: 'Rohan Singh', age: 3, parent: 'Neha Singh', status: 'active', lastVisit: '2024-03-10' },
  ]

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         child.parent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || child.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">Volunteer Dashboard</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded border border-input bg-background text-foreground w-full md:w-64"
              />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 rounded border border-input bg-background text-foreground w-full md:w-40"
              >
                <option value="all">All Children</option>
                <option value="active">Active</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>

          {/* Restore original grid layout for user cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
            {filteredChildren.map((child) => (
              <Link 
                href={`/volunteers/child/${child.id}`} 
                key={child.id}
                className="block"
              >
                <div className="bg-white border-2 border-[#FEAA00] p-4 rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-semibold text-card-foreground">{child.name}</h2>
                      <p className="text-sm text-muted-foreground">Age: {child.age}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      child.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {child.status === 'active' ? 'Active' : 'Flagged'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Parent: {child.parent}</p>
                  <p className="text-xs text-muted-foreground">Last Visit: {new Date(child.lastVisit).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>

          {filteredChildren.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No children found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}