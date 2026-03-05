import jsPDF from 'jspdf'

export interface TableOfContentsItem {
  title: string
  pageNumber: number
}

export interface Section {
  id: string
  title: string
  questions: Array<{
    id: string
    text: string
    type: string
    options?: string[]
  }>
}

/**
 * Generate an Acknowledgement/Header page PDF as base64
 * This is the first page of the document
 */
export const generateAcknowledgementPage = (): string => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header background - Blue stripe at top
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text('Official Questionnaire', 15, 35)

  // Reset to dark text
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)

  // Document info section
  const startY = 80
  let currentY = startY

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Document Acknowledgement', 15, currentY)
  currentY += 15

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const acknowledgementText = `This questionnaire is an official document containing important information 
regarding your organization. Please read each question carefully and provide 
accurate and complete responses.

CONFIDENTIALITY STATEMENT:
This document contains confidential and proprietary information intended exclusively 
for the authorized recipient. Unauthorized access, use, disclosure, or distribution 
is strictly prohibited.

INSTRUCTIONS:
• Read all instructions carefully before completing the questionnaire
• Answer all questions thoroughly and accurately
• Provide supporting documentation where requested
• Submit completed forms within the specified timeframe
• Contact the author for any clarifications or questions

By completing and submitting this questionnaire, you acknowledge that:
✓ All information provided is true and accurate to the best of your knowledge
✓ You have read and understand the confidentiality terms
✓ You have the authority to provide this information on behalf of your organization`;

  doc.text(acknowledgementText, 15, currentY, {
    maxWidth: pageWidth - 30,
    align: 'left'
  })

  // Footer information
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const docFooterY = pageHeight - 20
  doc.text(`Document Generated: ${new Date().toLocaleDateString()}`, 15, docFooterY)
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 15, docFooterY + 5)

  // Page number
  doc.setFontSize(8)
  doc.text('Page 1', pageWidth - 20, docFooterY + 5)

  return doc.output('dataurlstring')
}

/**
 * Generate Table of Contents page
 * Shows section names and their page numbers
 */
export const generateTableOfContentsPage = (sections: Array<{ title: string; pageNumber: number }>): string => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header
  doc.setFillColor(240, 240, 240)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(25, 118, 210)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Table of Contents', 15, 20)

  // Reset
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  let currentY = 50

  // TOC entries
  sections.forEach((section, index) => {
    // Section number and title
    doc.setFontSize(11)
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F')
    }

    const sectionText = `${index + 1}. ${section.title}`
    doc.text(sectionText, 15, currentY)

    // Page number on the right
    const pageNumberText = `...... ${section.pageNumber}`
    const pageNumberWidth = doc.getTextWidth(pageNumberText)
    doc.text(pageNumberText, pageWidth - pageNumberWidth - 15, currentY)

    currentY += 10
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Table of Contents', 15, pageHeight - 10)
  doc.text('Page 2', pageWidth - 20, pageHeight - 10)

  return doc.output('dataurlstring')
}

/**
 * Generate a Signature/Footer page
 * This is the last page containing signature fields
 */
export const generateSignaturePage = (): string => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header stripe
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Signature & Approval', 15, 28)

  // Reset
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  let currentY = 60

  // Certification text
  const certificationText = `I hereby certify that the information provided in this questionnaire is true, 
accurate, and complete to the best of my knowledge and belief. I understand 
that any false or misleading information may result in serious consequences.`

  doc.setFontSize(9)
  doc.text(certificationText, 15, currentY, {
    maxWidth: pageWidth - 30,
    align: 'left'
  })

  currentY += 35

  // Signature fields
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  // Authorized Signatory
  doc.text('Authorized Signatory:', 15, currentY)
  doc.setDrawColor(150, 150, 150)
  doc.line(15, currentY + 10, 90, currentY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature', 15, currentY + 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Name (Print):', 95, currentY)
  doc.setDrawColor(150, 150, 150)
  doc.line(95, currentY + 10, pageWidth - 15, currentY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Full Name', 95, currentY + 13)

  currentY += 25

  // Date and Title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.text('Date:', 15, currentY)
  doc.setDrawColor(150, 150, 150)
  doc.line(15, currentY + 10, 90, currentY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('DD/MM/YYYY', 15, currentY + 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Title/Position:', 95, currentY)
  doc.setDrawColor(150, 150, 150)
  doc.line(95, currentY + 10, pageWidth - 15, currentY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Job Title', 95, currentY + 13)

  currentY += 30

  // Witness/Reviewer section
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Reviewer/Witness (if applicable):', 15, currentY)

  currentY += 12

  doc.text('Signature:', 15, currentY)
  doc.setDrawColor(150, 150, 150)
  doc.line(15, currentY + 10, 90, currentY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature', 15, currentY + 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Name (Print):', 95, currentY)
  doc.setDrawColor(150, 150, 150)
  doc.line(95, currentY + 10, pageWidth - 15, currentY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Full Name', 95, currentY + 13)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15)
  doc.text('Confidential - Authorized Recipient Only', 15, pageHeight - 10)
  doc.text('Signature Page', pageWidth - 50, pageHeight - 10)

  return doc.output('dataurlstring')
}

/**
 * Generate a complete questionnaire PDF with all content
 * Returns a full PDF with header, TOC, content, and signature pages
 */
export const generateCompletePdf = (): string => {
  const doc = new jsPDF()

  // Page 1 - Acknowledgement
  generateAcknowledgementPageContent(doc)
  doc.addPage()

  // Page 2 - Table of Contents (simplified)
  generateTableOfContentsPageContent(doc)
  doc.addPage()

  // Page 3 onwards - Questionnaire content
  generateQuestionnaireContent(doc)
  doc.addPage()

  // Last page - Signature
  generateSignaturePageContent(doc)

  return doc.output('dataurlstring')
}

// Helper functions to add content to existing PDF
function generateAcknowledgementPageContent(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header background
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text('Official Questionnaire', 15, 35)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Document Acknowledgement', 15, 75)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const text =
    'This questionnaire contains confidential information. By completing this form, you acknowledge reading and understanding all instructions and terms.'

  doc.text(text, 15, 90, { maxWidth: pageWidth - 30 })

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Page 1 of Multiple', 15, pageHeight - 10)
}

function generateTableOfContentsPageContent(doc: jsPDF): void {
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setTextColor(25, 118, 210)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Table of Contents', 15, 20)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const sections = [
    { name: 'Company Overview', page: 3 },
    { name: 'Financial Information', page: 4 },
    { name: 'Compliance & Risk', page: 5 }
  ]

  let y = 40
  sections.forEach((section, idx) => {
    const text = `${idx + 1}. ${section.name} ${'.'.repeat(40 - section.name.length)} ${section.page}`
    doc.text(text, 15, y)
    y += 8
  })

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Page 2 of Multiple', 15, pageHeight - 10)
}

function generateQuestionnaireContent(doc: jsPDF): void {
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setTextColor(25, 118, 210)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Section 1: Company Overview', 15, 20)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  doc.text('1. What is your company type?', 15, 35)
  doc.text('☐ Private Limited     ☐ Public Limited     ☐ Partnership     ☐ Sole Proprietorship', 20, 45)

  doc.text('2. How many years has your company been in operation?', 15, 60)
  doc.text('_________________________________________________________________', 20, 72)

  doc.text('3. Which countries does your company operate in?', 15, 85)
  doc.text('☐ USA     ☐ UK     ☐ India     ☐ Germany     ☐ Canada     ☐ Australia', 20, 95)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Page 3 of Multiple', 15, pageHeight - 10)
}

function generateSignaturePageContent(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Signature & Approval', 15, 28)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const certText =
    'I certify that all information provided in this questionnaire is true and accurate.'
  doc.text(certText, 15, 60, { maxWidth: pageWidth - 30 })

  // Signature line
  doc.setDrawColor(150)
  doc.line(15, 85, 90, 85)
  doc.setFontSize(8)
  doc.text('Authorized Signatory', 15, 90)

  doc.line(95, 85, pageWidth - 15, 85)
  doc.text('Date', 95, 90)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Final Page', 15, pageHeight - 10)
}

/**
 * Generate a complete merged PDF with all pages
 * Includes: Acknowledgement, TOC, Questionnaire Content, and Signature Page
 */
export const generateMergedCompletePdf = (sections: Section[]): string => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let pageNumber = 1

  // ===== PAGE 1: ACKNOWLEDGEMENT =====
  // Header background
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 50, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Official Questionnaire', 15, 35)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Document Acknowledgement', 15, 75)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  const acknowledgementText = `This questionnaire is an official document containing important information 
regarding your organization. Please read each question carefully and provide 
accurate and complete responses.

CONFIDENTIALITY STATEMENT:
This document contains confidential and proprietary information intended exclusively 
for the authorized recipient. Unauthorized access, use, disclosure, or distribution 
is strictly prohibited.

INSTRUCTIONS:
• Read all instructions carefully before completing the questionnaire
• Answer all questions thoroughly and accurately
• Provide supporting documentation where requested
• Submit completed forms within the specified timeframe

By completing and submitting this questionnaire, you acknowledge that:
✓ All information provided is true and accurate to the best of your knowledge
✓ You have read and understand the confidentiality terms
✓ You have the authority to provide this information on behalf of your organization`

  doc.text(acknowledgementText, 15, 90, { maxWidth: pageWidth - 30 })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(`${new Date().toLocaleDateString()}`, 15, pageHeight - 10)
  doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10)
  pageNumber++

  // ===== PAGE 2: TABLE OF CONTENTS =====
  doc.addPage()
  
  doc.setFillColor(240, 240, 240)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(25, 118, 210)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Table of Contents', 15, 20)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  let currentY = 50
  const tocPages: { name: string; page: number }[] = []
  
  sections.forEach((section, index) => {
    const pageNum = pageNumber + index
    tocPages.push({ name: section.title, page: pageNum })
    
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F')
    }

    const sectionText = `${index + 1}. ${section.title}`
    doc.text(sectionText, 15, currentY)

    const pageNumberText = `...... ${pageNum}`
    const pageNumberWidth = doc.getTextWidth(pageNumberText)
    doc.text(pageNumberText, pageWidth - pageNumberWidth - 15, currentY)

    currentY += 10
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Table of Contents', 15, pageHeight - 10)
  doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10)
  pageNumber++

  // ===== PAGES 3+: QUESTIONNAIRE CONTENT =====
  sections.forEach((section, sectionIndex) => {
    doc.addPage()

    // Section Header
    doc.setTextColor(25, 118, 210)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Section ${sectionIndex + 1}: ${section.title}`, 15, 20)

    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    let sectionY = 40

    // Questions
    section.questions.forEach((question, qIndex) => {
      // Question text
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      
      const qNumber = `${sectionIndex + 1}.${qIndex + 1}`
      const questionLines = doc.splitTextToSize(
        `${qNumber} ${question.text}`,
        pageWidth - 30
      )
      doc.text(questionLines, 15, sectionY)
      sectionY += questionLines.length * 5 + 3

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      // Question options/response area
      if (question.type === 'single-select' && question.options) {
        question.options.forEach((option) => {
          doc.text(`☐ ${option}`, 20, sectionY)
          sectionY += 5
        })
        sectionY += 3
      } else if (question.type === 'multi-select' && question.options) {
        doc.text('(Select all that apply)', 20, sectionY)
        sectionY += 4
        question.options.forEach((option) => {
          doc.text(`☐ ${option}`, 20, sectionY)
          sectionY += 5
        })
        sectionY += 3
      } else if (question.type === 'text') {
        doc.setDrawColor(150)
        doc.line(20, sectionY, pageWidth - 15, sectionY)
        sectionY += 4
        doc.line(20, sectionY, pageWidth - 15, sectionY)
        sectionY += 2
        doc.line(20, sectionY, pageWidth - 15, sectionY)
        sectionY += 6
      } else if (question.type === 'date') {
        doc.text('[  /  /     ]', 20, sectionY)
        sectionY += 6
      }

      sectionY += 3

      // Check if we need a new page
      if (sectionY > pageHeight - 20) {
        doc.addPage()
        sectionY = 20
        pageNumber++
      }
    })

    pageNumber++

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Section ${sectionIndex + 1}: ${section.title}`, 15, pageHeight - 10)
    doc.text(`Page ${pageNumber - 1}`, pageWidth - 20, pageHeight - 10)
  })

  // ===== FINAL PAGE: SIGNATURE & APPROVAL =====
  doc.addPage()

  // Header
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Signature & Approval', 15, 28)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const certText = `I hereby certify that the information provided in this questionnaire is true, 
accurate, and complete to the best of my knowledge and belief.`
  doc.text(certText, 15, 60, { maxWidth: pageWidth - 30 })

  let sigY = 85

  // Authorized Signatory
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Authorized Signatory:', 15, sigY)
  doc.setDrawColor(150)
  doc.line(15, sigY + 10, 90, sigY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature', 15, sigY + 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Name (Print):', 95, sigY)
  doc.setDrawColor(150)
  doc.line(95, sigY + 10, pageWidth - 15, sigY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Full Name', 95, sigY + 13)

  sigY += 25

  // Date and Title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.text('Date:', 15, sigY)
  doc.setDrawColor(150)
  doc.line(15, sigY + 10, 90, sigY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('DD/MM/YYYY', 15, sigY + 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Title/Position:', 95, sigY)
  doc.setDrawColor(150)
  doc.line(95, sigY + 10, pageWidth - 15, sigY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Job Title', 95, sigY + 13)

  sigY += 30

  // Witness/Reviewer section
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Reviewer/Witness (if applicable):', 15, sigY)

  sigY += 12

  doc.text('Signature:', 15, sigY)
  doc.setDrawColor(150)
  doc.line(15, sigY + 10, 90, sigY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature', 15, sigY + 13)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Name (Print):', 95, sigY)
  doc.setDrawColor(150)
  doc.line(95, sigY + 10, pageWidth - 15, sigY + 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Full Name', 95, sigY + 13)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15)
  doc.text('Confidential - Authorized Recipient Only', 15, pageHeight - 10)
  doc.text(`Page ${pageNumber + 1}`, pageWidth - 20, pageHeight - 10)

  return doc.output('dataurlstring')
}
