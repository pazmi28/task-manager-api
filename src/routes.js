const express = require('express')
const router = express.Router()
const { db } = require('./firebase')

const COLLECTION = 'tasks'

// GET /api/tasks — obtener todas las tareas
router.get('/tasks', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    res.status(200).json({ tasks })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/tasks/:id — obtener una tarea
router.get('/tasks/:id', async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get()
    if (!doc.exists) return res.status(404).json({ error: 'Tarea no encontrada' })
    res.status(200).json({ task: { id: doc.id, ...doc.data() } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/tasks — crear tarea
router.post('/tasks', async (req, res) => {
  try {
    const { title, priority } = req.body
    if (!req.body || !req.body.title) {
  return res.status(400).json({ error: 'El campo title es obligatorio' });
}
if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
  return res.status(400).json({ error: 'El campo title debe ser un texto no vacío' });
}
if (req.body.title.length > 100) {
  return res.status(400).json({ error: 'El campo title no puede superar los 100 caracteres' });
}

    const task = {
      title,
      priority: priority || 'normal',
      completed: false,
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection(COLLECTION).add(task)
    res.status(201).json({ task: { id: docRef.id, ...task } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/tasks/:id — actualizar tarea
router.patch('/tasks/:id', async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { title, priority, completed } = req.body
    const updates = {}
    if (title !== undefined) updates.title = title
    if (priority !== undefined) updates.priority = priority
    if (completed !== undefined) updates.completed = completed

    await ref.update(updates)
    const updated = await ref.get()
    res.status(200).json({ task: { id: updated.id, ...updated.data() } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/tasks/:id — eliminar tarea
router.delete('/tasks/:id', async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) return res.status(404).json({ error: 'Tarea no encontrada' })

    await ref.delete()
    res.status(200).json({ message: 'Tarea eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/docs — documentación básica
router.get('/docs', (req, res) => {
  res.json({
    name: 'Task Manager API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET',    path: '/api/tasks',     description: 'Obtener todas las tareas' },
      { method: 'GET',    path: '/api/tasks/:id', description: 'Obtener una tarea por ID' },
      { method: 'POST',   path: '/api/tasks',     description: 'Crear tarea (title obligatorio, max 100 chars)' },
      { method: 'PATCH',  path: '/api/tasks/:id', description: 'Actualizar campos parcialmente' },
      { method: 'DELETE', path: '/api/tasks/:id', description: 'Eliminar tarea' },
      { method: 'GET',    path: '/api/docs',      description: 'Esta documentación' }
    ]
  })
})

module.exports = router