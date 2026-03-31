const express = require('express')
const router = express.Router()

// Base de datos en memoria (por ahora, sin Firebase)
let tasks = []
let nextId = 1

// GET /api/tasks — obtener todas las tareas
router.get('/tasks', (req, res) => {
  res.status(200).json({ tasks })
})

// GET /api/tasks/:id — obtener una tarea por id
router.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id))
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })
  res.status(200).json({ task })
})

// POST /api/tasks — crear tarea
router.post('/tasks', (req, res) => {
  const { title, priority } = req.body

  if (!title) {
    return res.status(400).json({ error: 'El campo title es obligatorio' })
  }

  const task = {
    id: nextId++,
    title,
    priority: priority || 'normal',
    completed: false,
    createdAt: new Date().toISOString()
  }

  tasks.push(task)
  res.status(201).json({ task })
})

// PATCH /api/tasks/:id — actualizar tarea parcialmente
router.patch('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id))
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })

  const { title, priority, completed } = req.body
  if (title !== undefined) task.title = title
  if (priority !== undefined) task.priority = priority
  if (completed !== undefined) task.completed = completed

  res.status(200).json({ task })
})

// DELETE /api/tasks/:id — eliminar tarea
router.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Tarea no encontrada' })

  tasks.splice(index, 1)
  res.status(200).json({ message: 'Tarea eliminada correctamente' })
})

module.exports = router