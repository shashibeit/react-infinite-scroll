import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Users from './pages/Users'
import Products from './pages/Products'
import Categories from './pages/Categories'
import DragAndDrop from './pages/DragAndDrop'
import QuestionDetails from './pages/QuestionDetails'
import DocumentPreview from './pages/DocumentPreview'
import './App.css'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<QuestionDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/drag-drop" element={<DragAndDrop />} />
        <Route path="/document-preview" element={<DocumentPreview />} />
      </Routes>
    </Router>
  )
}

export default App
