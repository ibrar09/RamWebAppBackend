import * as contactService from "../services/contactService.js";

export const createContactItem = async (req, res) => {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContact = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateContactItem = async (req, res) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body);
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteContactItem = async (req, res) => {
  try {
    await contactService.deleteContact(req.params.id);
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
