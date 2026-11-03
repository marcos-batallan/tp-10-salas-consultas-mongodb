function crearControladorReservas(servicioReservas) {
  async function listarReservas(req, res) {
    const reservas = await servicioReservas.listar();

    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas,
    });
  }

  function mostrarNuevaReserva(req, res) {
    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas,
      turnosPermitidos,
      errores: null,
      valores: {},
    });
  }

  async function mostrarDetalleReserva(req, res) {
    const id = req.params.id;
    const reserva = await servicioReservas.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador",
      });
    }
    res.render("reservas/detalle", {
      titulo: "Detalle de reserva",
      reserva,
    });
  }

  async function crearReserva(req, res) {
    await servicioReservas.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  async function mostrarEstado(req, res) {
    const cantidadReservas = await servicioReservas.contar();

    res.json({
      servicio: "activo",
      reservas: cantidadReservas,
      solicitudId: res.locals.solicitudId,
    });
  }

  // *** CONTROLADORES API ***

  async function listarApi(req, res) {
    const permitidos = ["sala", "orden", "pagina", "limite"];

    for (const campo of Object.keys(req.query)) {
      if (!permitidos.includes(campo)) {
        return res.status(400).json({ error: "Parámetro no permitido." });
      }
    }

    const sala = req.query.sala;

    // Si "sala" aparece repetido en la URL, Express puede
    // representarlo como un arreglo. No se acepta ese formato.
    if (sala !== undefined) {
      if (Array.isArray(sala)) {
        return res.status(400).json({
          error: "El parámetro 'sala' debe aparecer una sola vez.",
        });
      }

      if (typeof sala !== "string" || sala.trim() === "") {
        return res
          .status(400)
          .json({ error: "El texto de sala debe tener contenido." });
      }
    }

    let orden = "estudiante";

    if (req.query.orden !== undefined) {
      orden = req.query.orden;

      if (Array.isArray(orden)) {
        return res.status(400).json({
          error: "El parámetro 'orden' debe aparecer una sola vez.",
        });
      }

      if (
        orden !== "estudiante" &&
        orden !== "personas-asc" &&
        orden !== "personas-desc"
      ) {
        return res.status(400).json({ error: "Orden no permitido." });
      }
    }

    let pagina = 1;

    if (req.query.pagina !== undefined) {
      if (Array.isArray(req.query.pagina)) {
        return res.status(400).json({
          error: "El parámetro 'pagina' debe aparecer una sola vez.",
        });
      }

      pagina = Number(req.query.pagina);

      if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
        return res.status(400).json({
          error: "El parámetro 'pagina' debe ser un entero entre 1 y 1000.",
        });
      }
    }

    let limite = 2;

    if (req.query.limite !== undefined) {
      if (Array.isArray(req.query.limite)) {
        return res.status(400).json({
          error: "El parámetro 'limite' debe aparecer una sola vez.",
        });
      }

      limite = Number(req.query.limite);

      if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
        return res.status(400).json({
          error: "El parámetro 'limite' debe ser un entero entre 1 y 20.",
        });
      }
    }

    const resultado = await servicioReservas.consultar(
      sala,
      orden,
      pagina,
      limite,
    );

    return res.json(resultado);
  }

  async function obtenerApi(req, res) {
    const reserva = await servicioReservas.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: "Reserva no encontrada.",
      });
    }
    return res.json(reserva);
  }

  async function crearApi(req, res) {
    const reserva = await servicioReservas.crear(req.reservaValidada);
    return res
      .location(`/api/reservas/${reserva.id}`)
      .status(201)
      .json(reserva);
  }

  async function eliminarApi(req, res) {
    const eliminado = await servicioReservas.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({
        error: "Reserva no encontrada.",
      });
    }
    res.status(204).end();
  }

  async function reemplazarApi(req, res) {
    const reserva = await servicioReservas.reemplazar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    return res.json(reserva);
  }

  async function actualizarApi(req, res) {
    const reserva = await servicioReservas.actualizar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    return res.json(reserva);
  }

  return {
    listarReservas,
    mostrarNuevaReserva,
    mostrarDetalleReserva,
    crearReserva,
    mostrarEstado,
    listarApi,
    obtenerApi,
    crearApi,
    eliminarApi,
    reemplazarApi,
    actualizarApi,
  };
}

module.exports = { crearControladorReservas };
