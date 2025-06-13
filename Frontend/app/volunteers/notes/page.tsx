'use client'

import { useState } from 'react'
import { Plus, BookOpen, Star, AlertCircle, Calendar } from 'lucide-react'

type NoteCategory = 'all' | 'important' | 'meetings' | 'observations'

interface Note {
  id: string
  content: string
  category: NoteCategory
  date: string
  isImportant?: boolean
}

export default function NotesPage() {
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'First meeting with Riya\'s parents went well.',
      category: 'meetings',
      date: '2024-03-20',
      isImportant: true
    },
    {
      id: '2',
      content: 'Noticed improvement in motor skills during today\'s session.',
      category: 'observations',
      date: '2024-03-19'
    }
  ])
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('all')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleAddNote = () => {
    if (note.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: note.trim(),
        category: 'observations',
        date: new Date().toISOString().split('T')[0]
      }
      setNotes([newNote, ...notes])
      setNote('')
      setIsAddingNote(false)
    }
  }

  const filteredNotes = selectedCategory === 'all' 
    ? notes 
    : notes.filter(note => note.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'All Notes', icon: BookOpen },
    { id: 'important', label: 'Important', icon: Star },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'observations', label: 'Observations', icon: AlertCircle }
  ] as const

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Categories</h2>
          <nav className="space-y-1">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">Volunteer Notes</h1>
            <button
              onClick={() => setIsAddingNote(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </button>
          </div>

          {isAddingNote && (
            <div className="bg-card shadow-md rounded-xl p-4 md:p-6 mb-6 border-2 border-[#FEAA00]">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your observation here..."
                className="w-full border border-input rounded-lg p-3 mb-4 resize-none focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 rounded-lg font-medium border border-input hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {filteredNotes.length > 0 ? (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-card shadow-md rounded-xl p-4 border-2 border-[#FEAA00]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {note.isImportant && (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm text-muted-foreground">{note.date}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                      {note.category}
                    </span>
                  </div>
                  <p className="text-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No notes found in this category.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}