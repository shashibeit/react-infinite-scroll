import { useState } from 'react'
import { Box, Typography, Paper, Card, CardContent } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

interface Question {
  id: number
  text: string
  order: number
}

interface Section {
  id: number
  name: string
  order: number
  questions: Question[]
}

function DragAndDrop() {
  const [sections, setSections] = useState<Section[]>(() => {
    // Initialize 10 sections with questions
    const initialSections: Section[] = []
    for (let i = 1; i <= 10; i++) {
      const questions: Question[] = []
      const numQuestions = Math.floor(Math.random() * 5) + 3 // 3-7 questions per section
      for (let j = 1; j <= numQuestions; j++) {
        questions.push({
          id: i * 100 + j,
          text: `Question ${j} in Section ${i}`,
          order: j
        })
      }
      initialSections.push({
        id: i,
        name: `Section ${i}`,
        order: i,
        questions
      })
    }
    return initialSections
  })

  const [draggedSection, setDraggedSection] = useState<number | null>(null)
  const [draggedQuestion, setDraggedQuestion] = useState<{ sectionId: number; questionId: number } | null>(null)
  const [dragOverSection, setDragOverSection] = useState<number | null>(null)
  const [dragOverQuestion, setDragOverQuestion] = useState<{ sectionId: number; questionId: number } | null>(null)

  // Section drag handlers
  const handleSectionDragStart = (e: React.DragEvent, sectionId: number) => {
    setDraggedSection(sectionId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleSectionDragOver = (e: React.DragEvent, sectionId: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedSection !== null && draggedSection !== sectionId) {
      setDragOverSection(sectionId)
    }
  }

  const handleSectionDragLeave = () => {
    setDragOverSection(null)
  }

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedSection === null || draggedSection === targetSectionId) {
      setDragOverSection(null)
      return
    }

    setSections(prevSections => {
      const newSections = [...prevSections]
      const draggedIndex = newSections.findIndex(s => s.id === draggedSection)
      const targetIndex = newSections.findIndex(s => s.id === targetSectionId)
      
      // Remove dragged section
      const [removed] = newSections.splice(draggedIndex, 1)
      // Insert at target position
      newSections.splice(targetIndex, 0, removed)
      
      // Update order numbers
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1
      }))
    })

    setDraggedSection(null)
    setDragOverSection(null)
  }

  const handleSectionDragEnd = () => {
    setDraggedSection(null)
    setDragOverSection(null)
  }

  // Question drag handlers
  const handleQuestionDragStart = (e: React.DragEvent, sectionId: number, questionId: number) => {
    e.stopPropagation()
    setDraggedQuestion({ sectionId, questionId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleQuestionDragOver = (e: React.DragEvent, sectionId: number, questionId: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedQuestion && 
        (draggedQuestion.sectionId !== sectionId || draggedQuestion.questionId !== questionId)) {
      setDragOverQuestion({ sectionId, questionId })
    }
  }

  const handleQuestionDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    setDragOverQuestion(null)
  }

  const handleQuestionDrop = (e: React.DragEvent, targetSectionId: number, targetQuestionId: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedQuestion) {
      setDragOverQuestion(null)
      return
    }

    const { sectionId: sourceSectionId, questionId: sourceQuestionId } = draggedQuestion

    setSections(prevSections => {
      const newSections = [...prevSections]
      const sourceSectionIndex = newSections.findIndex(s => s.id === sourceSectionId)
      const targetSectionIndex = newSections.findIndex(s => s.id === targetSectionId)
      
      if (sourceSectionIndex === -1 || targetSectionIndex === -1) return prevSections

      const sourceSection = { ...newSections[sourceSectionIndex] }
      const targetSection = { ...newSections[targetSectionIndex] }

      // Find question indices
      const sourceQuestionIndex = sourceSection.questions.findIndex(q => q.id === sourceQuestionId)
      const targetQuestionIndex = targetSection.questions.findIndex(q => q.id === targetQuestionId)

      if (sourceQuestionIndex === -1 || targetQuestionIndex === -1) return prevSections

      if (sourceSectionId === targetSectionId) {
        // Same section - just reorder
        const questions = [...sourceSection.questions]
        const [removed] = questions.splice(sourceQuestionIndex, 1)
        questions.splice(targetQuestionIndex, 0, removed)
        
        // Update order numbers
        sourceSection.questions = questions.map((q, index) => ({ ...q, order: index + 1 }))
        newSections[sourceSectionIndex] = sourceSection
      } else {
        // Different sections - move question
        const sourceQuestions = [...sourceSection.questions]
        const targetQuestions = [...targetSection.questions]
        
        const [removed] = sourceQuestions.splice(sourceQuestionIndex, 1)
        targetQuestions.splice(targetQuestionIndex, 0, removed)
        
        // Update order numbers
        sourceSection.questions = sourceQuestions.map((q, index) => ({ ...q, order: index + 1 }))
        targetSection.questions = targetQuestions.map((q, index) => ({ ...q, order: index + 1 }))
        
        newSections[sourceSectionIndex] = sourceSection
        newSections[targetSectionIndex] = targetSection
      }

      return newSections
    })

    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  const handleQuestionDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Drag & Drop - Reorder Sections and Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag sections to reorder them. Drag questions within or between sections to reorder.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map((section) => (
          <Paper
            key={section.id}
            draggable
            onDragStart={(e) => handleSectionDragStart(e, section.id)}
            onDragOver={(e) => handleSectionDragOver(e, section.id)}
            onDragLeave={handleSectionDragLeave}
            onDrop={(e) => handleSectionDrop(e, section.id)}
            onDragEnd={handleSectionDragEnd}
            sx={{
              p: 2,
              cursor: 'grab',
              backgroundColor: draggedSection === section.id ? '#e3f2fd' : '#fff',
              border: dragOverSection === section.id ? '2px dashed #1976d2' : '1px solid #ddd',
              transition: 'all 0.2s ease',
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DragIndicatorIcon sx={{ mr: 1, color: '#666' }} />
              <Typography variant="h6">
                {section.order}. {section.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                ({section.questions.length} questions)
              </Typography>
            </Box>

            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 1.5,
                pl: 4
              }}
            >
              {section.questions.map((question) => (
                <Card
                  key={question.id}
                  draggable
                  onDragStart={(e) => handleQuestionDragStart(e, section.id, question.id)}
                  onDragOver={(e) => handleQuestionDragOver(e, section.id, question.id)}
                  onDragLeave={handleQuestionDragLeave}
                  onDrop={(e) => handleQuestionDrop(e, section.id, question.id)}
                  onDragEnd={handleQuestionDragEnd}
                  sx={{
                    cursor: 'grab',
                    backgroundColor: 
                      draggedQuestion?.questionId === question.id ? '#fff3e0' : '#f5f5f5',
                    border: 
                      dragOverQuestion?.sectionId === section.id && 
                      dragOverQuestion?.questionId === question.id 
                        ? '2px dashed #ff9800' 
                        : '1px solid #ddd',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 2
                    },
                    '&:active': {
                      cursor: 'grabbing'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box
                        sx={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#1976d2',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {question.order}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                        {question.text}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}

export default DragAndDrop
