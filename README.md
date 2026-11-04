# TP10 – Consultas y paginación de reservas

Aplicación desarrollada con **Node.js, Express y MongoDB**, que permite gestionar reservas de salas de estudio mediante una API REST y vistas HTML.

Este trabajo práctico amplía el proyecto del TP09 incorporando consultas con parámetros para filtrar, ordenar y paginar las reservas, además de seleccionar los campos que se exponen en las respuestas de la API.

## Tecnologías utilizadas

- **Node.js:** >= 22.13.0
- **Express:** 5.2.1
- **Mongoose:** 9.11.2
- **EJS:** 6.0.1
- **express-ejs-layouts:** 2.5.1
- **Morgan:** 1.12.1
- **Prettier:** 3.9.9
- **ESLint:** 10.12.0
- **MongoDB Atlas:** base de datos `reservas_salas_u10`
- **Postman:** 12.35.1

## Requisitos previos

- Node.js 22.13.0 o superior.
- npm.
- Una cuenta y un clúster de MongoDB Atlas.
- Acceso de red al clúster de MongoDB Atlas.

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/marcos-batallan/tp-10-salas-consultas-mongodb.git
cd tp-10-salas-consultas-mongodb
```

### 2. Instalar dependencias

```bash
npm ci
```

### 3. Configurar las variables de entorno

Crear un archivo `.env` a partir de `.env.example` y completar los valores correspondientes:

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
```

La URI debe apuntar a la base de datos `reservas_salas_u10` de MongoDB Atlas.

**Importante:** el archivo `.env` contiene información privada y no debe subirse al repositorio.

### 4. Verificar la conexión

```bash
node --env-file=.env scripts/comprobar-conexion.js
```

Si la configuración es correcta, se mostrará:

```text
Conexión con MongoDB establecida.
```

### 5. Ejecutar la aplicación

```bash
node --env-file=.env src/index.js
```

Por defecto, la aplicación escucha en:

```text
http://localhost:3000
```

## Estructura del proyecto

```text
tp-10-salas-consultas-mongodb/
│
├── public/
│   ├── css/
│   │   └── estilos.css
│   └── img/
│       ├── favicon.svg
│       └── salas-estudio.svg
│
├── scripts/
│   ├── comprobar-conexion.js
│   ├── crear-reservas.js
│   ├── listar-reservas.js
│   └── validar-reserva.js
│
├── src/
│   ├── config/
│   │   ├── base-datos.js
│   │   └── entorno.js
│   │
│   ├── controladores/
│   │   └── reservas.js
│   │
│   ├── middleware/
│   │   ├── cambios-reservas.js
│   │   ├── errores.js
│   │   ├── reservas.js
│   │   └── solicitudes.js
│   │
│   ├── modelos/
│   │   └── reserva.js
│   │
│   ├── rutas/
│   │   ├── reservas-api.js
│   │   └── reservas.js
│   │
│   ├── servicios/
│   │   ├── reservas.js
│   │   └── reservas-mongo.js
│   │
│   ├── app.js
│   └── index.js
│
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── partials/
│   │   ├── encabezado.ejs
│   │   └── pie.ejs
│   ├── reservas/
│   │   ├── detalle.ejs
│   │   ├── lista.ejs
│   │   └── nueva.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── package-lock.json
├── package.json
└── README.md
```

## Consultas de la API

### Listar reservas

**GET** `/api/reservas`

La ruta permite consultar las reservas mediante los siguientes parámetros:

| Parámetro | Descripción | Valores / predeterminado |
|---|---|---|
| `sala` | Filtra por sala | Texto exacto |
| `orden` | Ordena los resultados | `estudiante`, `personas-asc`, `personas-desc` |
| `pagina` | Número de página | Predeterminado: `1` |
| `limite` | Cantidad de resultados por página | Predeterminado: `2` |

Ejemplo:

```http
GET /api/reservas?sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

### Respuesta

La API devuelve un objeto con los resultados y los datos de paginación:

```json
{
  "datos": [
    {
      "id": "identificador",
      "estudiante": "Bruno Ejemplo",
      "email": "bruno@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-10-28",
      "turno": "Mañana",
      "personas": 1,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 4,
  "paginas": 2
}
```

Los valores del ejemplo son ilustrativos. Los resultados reales dependen de los documentos almacenados en MongoDB.

### Validaciones de los parámetros

- Solo se aceptan los parámetros `sala`, `orden`, `pagina` y `limite`.
- No se permiten parámetros repetidos.
- `sala` debe contener texto.
- `orden` debe ser una de las opciones permitidas.
- `pagina` debe ser un entero entre 1 y 1000.
- `limite` debe ser un entero entre 1 y 20.
- Los parámetros desconocidos o inválidos generan una respuesta `400 Bad Request`.

Cuando una consulta no encuentra resultados, la API responde `200 OK` con `datos` vacío y los metadatos correspondientes.

La selección de campos se realiza desde el servicio. La respuesta pública incluye `id`, `estudiante`, `email`, `sala`, `fecha`, `turno`, `personas` y `estado`, sin exponer `_id` ni `__v`.

## Datos de prueba

Para verificar las consultas se cargaron seis reservas independientes mediante `POST /api/reservas`.

Todos los registros utilizan la fecha `2026-10-28`, turno `Mañana` y estado `pendiente`.

| Estudiante | Sala | Personas | ID |
|---|---|---:|---|
| Ana Ejemplo | Sala Norte | 2 | `6ae8a0339f41cc1ddea75850` |
| Bruno Ejemplo | Sala Norte | 1 | `6ae8a0919f41cc1ddea75851` |
| Carla Ejemplo | Sala Norte | 2 | `6ae8a0e99f41cc1ddea75852` |
| Diego Ejemplo | Sala Norte | 3 | `6ae8a11e9f41cc1ddea75853` |
| Elena Ejemplo | Sala Sur | 1 | `6ae8a1539f41cc1ddea75854` |
| Fabian Ejemplo | Sala Multimedia | 4 | `6ae8a18b9f41cc1ddea75855` |

Distribución inicial:

- Sala Norte: 4 reservas.
- Sala Sur: 1 reserva.
- Sala Multimedia: 1 reserva.
- Total: 6 reservas.

Estos datos se encuentran almacenados en MongoDB Atlas. La aplicación no los vuelve a insertar automáticamente al iniciarse.

## Pruebas realizadas

Las pruebas se realizaron con Postman y el navegador, utilizando los datos persistidos en MongoDB.

| Prueba | Resultado esperado | Resultado |
|---|---|---|
| Listado sin parámetros | Primera página, 2 registros, total 6 | Correcto |
| Filtro Sala Norte | 4 coincidencias | Correcto |
| Filtro Sala Sur | 1 coincidencia | Correcto |
| Filtro Sala Multimedia | 1 coincidencia | Correcto |
| Sala inexistente | Lista vacía | Correcto |
| Orden por personas ascendente | 1, 2, 2, 3 | Correcto |
| Orden por personas descendente | 3, 2, 2, 1 | Correcto |
| Paginación | 2 registros por página | Correcto |
| Página fuera del rango de resultados | Lista vacía y estado 200 | Correcto |
| Parámetros inválidos o repetidos | Respuesta 400 | Correcto |
| Selección de campos | Solo campos públicos | Correcto |

También se verificó la continuidad de las funcionalidades existentes:

- Consulta individual de reservas.
- Creación mediante POST.
- Reemplazo mediante PUT.
- Actualización parcial mediante PATCH.
- Eliminación mediante DELETE.
- Visualización del listado HTML.
- Visualización del formulario de nueva reserva.
- Visualización del detalle de una reserva.
- Consulta de `/estado`.
- Persistencia de los registros después de reiniciar el servidor.

Además, se comprobó que el POST ignora los campos `_id` y `estado` enviados por el cliente, generando el identificador desde MongoDB y aplicando el estado predeterminado `pendiente`. Los campos no permitidos continúan siendo rechazados.

## Organización de las consultas

La implementación respeta la estructura existente del proyecto y concentra la lógica de consulta en las capas correspondientes:

- **Controlador:** recibe y valida los parámetros de consulta de `listarApi`.
- **Servicio:** construye el filtro, determina el ordenamiento, calcula el salto, cuenta los documentos y aplica la selección de campos.
- **Modelo:** conserva la definición y las validaciones de las reservas.

La consulta de la API se mantiene separada del listado HTML. La función `listar` conserva su comportamiento para las vistas, mientras que `consultar` se utiliza para las consultas paginadas de la API.

El endpoint `/estado` continúa utilizando el conteo general de reservas, sin verse afectado por los filtros de la consulta.

## Consideración sobre relaciones entre documentos

Si en una futura versión se incorporara información propia de cada sala, como su capacidad máxima, ubicación o equipamiento, esos datos corresponderían a una entidad independiente de la reserva.

Una referencia permitiría relacionar cada reserva con una sala existente y reutilizar sus datos sin duplicarlos en cada documento. En cambio, los documentos embebidos podrían ser adecuados para información complementaria propia de una reserva que no necesite administrarse de manera independiente.

Para este trabajo práctico se mantiene el modelo actual, sin incorporar nuevas colecciones ni modificar la estructura de los documentos.

---

**Autor:** Marcos Batallán  
**Trabajo práctico:** TP10 – Consultas y paginación de reservas  
**Repositorio:** https://github.com/marcos-batallan/tp-10-salas-consultas-mongodb