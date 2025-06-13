'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function ChildProfilePage() {
  const { id } = useParams()
  const [flagged, setFlagged] = useState(false)

  const child = {
    name: 'Riya Sharma',
    age: 4,
    parent: 'Seema Sharma',
    milestones: [
      { domain: 'Language', value: 80 },
      { domain: 'Motor Skills', value: 60 },
      { domain: 'Cognition', value: 70 },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">{child.name}'s Profile</h1>
            <Link
              href={`/volunteers/notes?child=${id}`}
              className="inline-block mt-2 bg-primary text-primary-foreground px-4 py-2 rounded font-medium text-sm md:text-base hover:bg-primary/90 transition-colors"
            >
              View/Add Notes
            </Link>
          </div>
          <button
            onClick={() => setFlagged(true)}
            className="bg-destructive text-destructive-foreground px-4 py-2 rounded font-medium text-sm md:text-base hover:bg-destructive/90 transition-colors"
          >
            Flag Concern
          </button>
        </div>

        <div className="bg-card p-4 md:p-6 rounded-xl shadow mb-4 md:mb-6 border-2 border-[#FEAA00]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <p className="text-sm md:text-base text-muted-foreground"><strong className="text-card-foreground">Parent:</strong> {child.parent}</p>
            <p className="text-sm md:text-base text-muted-foreground"><strong className="text-card-foreground">Age:</strong> {child.age} years</p>
            <p className="text-sm md:text-base text-muted-foreground"><strong className="text-card-foreground">Status:</strong> {flagged ? <span className="text-destructive font-semibold">Flagged</span> : <span className="text-green-600">Active</span>}</p>
          </div>
        </div>

        <div className="bg-card p-4 md:p-6 rounded-xl shadow border-2 border-[#FEAA00]">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-card-foreground">Milestone Progress</h2>
          <ul className="space-y-2">
            {child.milestones.map((ms, idx) => (
              <li key={idx} className="flex justify-between items-center border-b border-border py-2">
                <span className="text-sm md:text-base text-muted-foreground">{ms.domain}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 md:w-32 h-2 bg-muted rounded-full">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${ms.value}%`, backgroundColor: '#FEAA00' }}
                    ></div>
                  </div>
                  <span className="text-sm md:text-base text-muted-foreground">{ms.value}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}