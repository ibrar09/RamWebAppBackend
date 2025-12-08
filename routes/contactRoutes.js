/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Manage customer contacts
 *
 * /contacts:
 *   post:
 *     summary: Create a contact message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+966500000000"
 *               message:
 *                 type: string
 *                 example: "I need help with my order."
 *               serviceneeded:
 *                 type: string
 *                 example: "Shipping Issue"
 *               source:
 *                 type: string
 *                 example: "website"
 *     responses:
 *       201:
 *         description: Contact created successfully
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: List of contacts
 *
 * /contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contact found
 *   put:
 *     summary: Update contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contact updated
 *   delete:
 *     summary: Delete contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contact deleted
 */


import express from "express";
import {
  createContactItem,
  getContacts,
  getContact,
  updateContactItem,
  deleteContactItem,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/", createContactItem);
router.get("/", getContacts);
router.get("/:id", getContact);
router.put("/:id", updateContactItem);
router.delete("/:id", deleteContactItem);

export default router;
