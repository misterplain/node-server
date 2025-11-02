const express = require("express");
const asyncHandler = require("express-async-handler");
const NoteItem = require("../models/NoteItem.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Helper to build hierarchical structure for current user
const buildHierarchy = async (userId) => {
  const notes = await NoteItem.find({ userId }).sort({
    order: 1,
    createdAt: 1,
  });
  const noteMap = {};
  const rootNotes = [];
  notes.forEach((note) => {
    noteMap[note._id] = { ...note.toObject(), children: [] };
  });
  notes.forEach((note) => {
    if (note.parentId && noteMap[note.parentId]) {
      noteMap[note.parentId].children.push(noteMap[note._id]);
    } else if (!note.parentId) {
      rootNotes.push(noteMap[note._id]);
    }
  });
  const sortChildren = (arr) => {
    arr.sort((a, b) => {
      // Sort pinned items first
      const pa = a.isPinned ?? false;
      const pb = b.isPinned ?? false;
      if (pa !== pb) return pb - pa; // pinned first
      // Then by urgency
      const ua = a.urgency ?? 3;
      const ub = b.urgency ?? 3;
      if (ub !== ua) return ub - ua; // 3 -> 1 descending
      const oa = a.order ?? 0;
      const ob = b.order ?? 0;
      if (oa !== ob) return oa - ob;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    arr.forEach((child) => {
      if (Array.isArray(child.children) && child.children.length) {
        sortChildren(child.children);
      }
    });
  };
  sortChildren(rootNotes);
  return rootNotes;
};

// @route   GET /api/notes
// @desc    Get all note items for the authenticated user
// @access  Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tree = await buildHierarchy(req.user._id);
    res.json(tree);
  })
);

// @route   GET /api/notes/:id
// @desc    Get a single note item by ID
// @access  Private
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const note = await NoteItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      res.status(404);
      throw new Error("Note not found");
    }

    res.json(note);
  })
);

// @route   POST /api/notes
// @desc    Create a new note item
// @access  Private
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, content, link, parentId, order, urgency } = req.body;

    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }

    // If parentId is provided, verify it exists and belongs to user
    if (parentId) {
      const parentNote = await NoteItem.findOne({
        _id: parentId,
        userId: req.user._id,
      });
      if (!parentNote) {
        res.status(404);
        throw new Error("Parent note not found");
      }
    }

    const note = await NoteItem.create({
      userId: req.user._id,
      title,
      content: content || "",
      link: link || null,
      parentId: parentId || null,
      order: order || 0,
      urgency: [1, 2, 3].includes(urgency) ? urgency : 3,
    });

    // If this note has a parent, add it to parent's children array
    if (parentId) {
      await NoteItem.findByIdAndUpdate(parentId, {
        $addToSet: { children: note._id },
      });
    }

    // Return updated hierarchy so client can refresh tree
    const tree = await buildHierarchy(req.user._id);
    res.status(201).json(tree);
  })
);

// @route   PUT /api/notes/:id
// @desc    Update a note item
// @access  Private
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const note = await NoteItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      res.status(404);
      throw new Error("Note not found");
    }

    const { title, content, link, order, parentId, urgency } = req.body;

    // Handle parent change
    if (parentId !== undefined) {
      // Cannot set parent to itself
      if (parentId === note._id) {
        res.status(400);
        throw new Error("A note cannot be its own parent");
      }

      // Validate new parent exists (unless null for root)
      let newParent = null;
      if (parentId) {
        newParent = await NoteItem.findOne({
          _id: parentId,
          userId: req.user._id,
        });
        if (!newParent) {
          res.status(404);
          throw new Error("New parent not found");
        }

        // Prevent cycles: walk up from newParent to root; it must not reach the note itself
        let cursor = newParent;
        while (cursor && cursor.parentId) {
          if (String(cursor.parentId) === String(note._id)) {
            res.status(400);
            throw new Error("Invalid parent: would create a cycle");
          }
          cursor = await NoteItem.findOne({
            _id: cursor.parentId,
            userId: req.user._id,
          });
        }
      }

      const oldParentId = note.parentId;
      // If parent changed, update parent links
      if (String(oldParentId || "") !== String(parentId || "")) {
        // Pull from old parent
        if (oldParentId) {
          await NoteItem.findByIdAndUpdate(oldParentId, {
            $pull: { children: note._id },
          });
        }
        // Add to new parent
        if (parentId) {
          await NoteItem.findByIdAndUpdate(parentId, {
            $addToSet: { children: note._id },
          });
        }
        note.parentId = parentId || null;
      }
    }

    note.title = title || note.title;
    note.content = content !== undefined ? content : note.content;
    note.link = link !== undefined ? link : note.link;
    note.order = order !== undefined ? order : note.order;
    if (urgency !== undefined) {
      if (![1, 2, 3].includes(urgency)) {
        res.status(400);
        throw new Error("Urgency must be 1, 2, or 3");
      }
      note.urgency = urgency;
    }
    if (req.body.hasOwnProperty("isPinned")) {
      note.isPinned = !!req.body.isPinned;
    }

    await note.save();
    const tree = await buildHierarchy(req.user._id);
    res.json(tree);
  })
);

// @route   DELETE /api/notes/:id
// @desc    Delete a note item (only if it has no children)
// @access  Private
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const note = await NoteItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      res.status(404);
      throw new Error("Note not found");
    }

    // Prevent deletion if it has any children
    const childCount = await NoteItem.countDocuments({
      parentId: note._id,
      userId: req.user._id,
    });
    if (childCount > 0) {
      res.status(400);
      throw new Error("Cannot delete a note that has children");
    }

    // Remove this note from parent's children array if it has a parent
    if (note.parentId) {
      await NoteItem.findByIdAndUpdate(note.parentId, {
        $pull: { children: note._id },
      });
    }

    // Delete the note itself
    await NoteItem.deleteOne({ _id: note._id });

    const tree = await buildHierarchy(req.user._id);
    res.json(tree);
  })
);

// @route   PATCH /api/notes/:id/reorder
// @desc    Reorder note items
// @access  Private
router.patch(
  "/:id/reorder",
  asyncHandler(async (req, res) => {
    const { order } = req.body;

    if (order === undefined) {
      res.status(400);
      throw new Error("Order is required");
    }

    const note = await NoteItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { order },
      { new: true }
    );

    if (!note) {
      res.status(404);
      throw new Error("Note not found");
    }

    res.json(note);
  })
);

module.exports = router;
