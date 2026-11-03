const express = require("express");

const { prepararAreaReservas } = require("../middleware/reservas");

function crearRouterReservas(controladorReservas, validarReserva) {
  const router = express.Router();

  router.use(prepararAreaReservas);

  router.get("/", controladorReservas.listarReservas);

  router.get("/nueva", controladorReservas.mostrarNuevaReserva);

  router.get("/:id", controladorReservas.mostrarDetalleReserva);
  router.post("/", validarReserva, controladorReservas.crearReserva);

  return router;
}

module.exports = { crearRouterReservas };
