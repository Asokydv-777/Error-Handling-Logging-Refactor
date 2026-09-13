const express = require("express");
const AppError = require("./errors/AppError");
const requestLogger = require("./middleware/logger");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(requestLogger);

let notes = [
  { id: 1, title: "First note", content: "Hello world" },
  { id: 2, title: "Second note", content: "Learning Express" },
];

app.get("/notes", (req, res) => {
  res.json(notes);
});

app.get("/notes/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return next(new AppError("Invalid id", 400, "InvalidId"));
  }
  const note = notes.find((n) => n.id === id);
  if (!note) {
    return next(new AppError("Note not found", 404, "NoteNotFound"));
  }
  res.json(note);
});

app.post("/notes", (req, res, next) => {
  const { title, content } = req.body || {};
  if (typeof title !== "string" || title.trim() === "") {
    return next(new AppError("title is required", 400, "ValidationError"));
  }
  if (typeof content !== "string" || content.trim() === "") {
    return next(new AppError("content is required", 400, "ValidationError"));
  }
  const note = { id: notes.length + 1, title, content };
  notes.push(note);
  res.status(201).json(note);
});

app.delete("/notes/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return next(new AppError("Invalid id", 400, "InvalidId"));
  }
  const before = notes.length;
  notes = notes.filter((n) => n.id !== id);
  if (notes.length === before) {
    return next(new AppError("Note not found", 404, "NoteNotFound"));
  }
  res.json({ ok: true });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log("Server on 3000"));
