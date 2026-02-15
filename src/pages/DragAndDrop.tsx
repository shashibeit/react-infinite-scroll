import { useState } from 'react'
import { Box, Typography, Paper, Card, CardContent } from '@mui/material'

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

  const [draggedQuestion, setDraggedQuestion] = useState<{ sectionId: number; questionId: number } | null>(null)
  const [dragOverQuestion, setDragOverQuestion] = useState<{ sectionId: number; questionId: number } | null>(null)
  const [reorderedQuestions, setReorderedQuestions] = useState<Set<number>>(new Set())

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

    if (
      draggedQuestion &&
      draggedQuestion.sectionId === sectionId &&
      draggedQuestion.questionId !== questionId
    ) {
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

    if (sourceSectionId !== targetSectionId) {
      setDraggedQuestion(null)
      setDragOverQuestion(null)
      return
    }

    setSections(prevSections => {
      const newSections = [...prevSections]
      const sourceSectionIndex = newSections.findIndex(s => s.id === sourceSectionId)
      
      if (sourceSectionIndex === -1) return prevSections

      const sourceSection = { ...newSections[sourceSectionIndex] }

      // Find question indices
      const sourceQuestionIndex = sourceSection.questions.findIndex(q => q.id === sourceQuestionId)
      const targetQuestionIndex = sourceSection.questions.findIndex(q => q.id === targetQuestionId)

      if (sourceQuestionIndex === -1 || targetQuestionIndex === -1) return prevSections

      // Same section - just reorder
      const questions = [...sourceSection.questions]
      const [removed] = questions.splice(sourceQuestionIndex, 1)
      questions.splice(targetQuestionIndex, 0, removed)

      // Update order numbers
      sourceSection.questions = questions.map((q, index) => ({ ...q, order: index + 1 }))
      newSections[sourceSectionIndex] = sourceSection

      return newSections
    })

    // Mark question as reordered
    setReorderedQuestions(prev => new Set(prev).add(sourceQuestionId))

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
        Drag & Drop - Reorder Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag questions within the same section to reorder.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map((section) => (
          <Paper
            key={section.id}
            sx={{
              p: 2,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                      draggedQuestion?.questionId === question.id ? '#fff3e0' : 
                      reorderedQuestions.has(question.id) ? '#e0e0e0' : '#f5f5f5',
                    border: 
                      dragOverQuestion?.sectionId === section.id && 
                      dragOverQuestion?.questionId === question.id 
                        ? '2px dashed #ff9800' : 
                      reorderedQuestions.has(question.id) ? '2px solid #757575' : '1px solid #ddd',
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
