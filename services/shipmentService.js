import { Shipment, Order } from "../models/index.js";

export const createShipment = async (data) => {
  return await Shipment.create(data);
};

export const getAllShipments = async () => {
  return await Shipment.findAll({
    include: [
      {
        model: Order,
        as: "order",
        attributes: ["order_number", "status"]
      }
    ]
  });
};

export const getShipmentById = async (id) => {
  return await Shipment.findByPk(id);
};

export const updateShipment = async (id, data) => {
  return await Shipment.update(data, { where: { id } });
};

export const deleteShipment = async (id) => {
  return await Shipment.destroy({ where: { id } });
};

export const getShipmentsByOrder = async (order_id) => {
  return await Shipment.findAll({ where: { order_id } });
};

export const getShipmentsByUser = async (userId) => {
  return await Shipment.findAll({
    include: [
      {
        model: Order,
        as: "order",
        where: { user_id: userId },
        attributes: ["id", "order_number", "status"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
