# Patrimony assets · Postman collection guide

Este documento reúne ejemplos de peticiones para el módulo Patrimônio del Church Finance API. Puedes copiarlos en Postman o Insomnia y ajustar identificadores/datos según tu ambiente. Todos los endpoints están protegidos por `PermissionMiddleware`, por lo que debes enviar el header `Authorization: Bearer <token>` correspondiente. A menos que se indique lo contrario, establece también `Content-Type: application/json`.

## Base URL sugerida

Configura una variable `{{baseUrl}}` apuntando al host de tu instancia (por ejemplo, `https://api.mi-iglesia.test`). Las rutas del módulo patrimonial cuelgan de `/patrimony/assets`.

## Crear un bien patrimonial

`POST {{baseUrl}}/patrimony/assets`

Carga la información principal del bien y (opcionalmente) hasta 3 anexos. El middleware completará campos como `performedBy` utilizando el usuario autenticado.

```json
{
  "name": "Piano Yamaha C3",
  "category": "instrument",
  "value": 48000,
  "acquisitionDate": "2024-04-15",
  "congregationId": "urn:church:central",
  "location": "Salón principal",
  "responsibleId": "urn:user:music-director",
  "status": "ACTIVE",
  "attachments": [
    {
      "name": "Factura.pdf",
      "url": "https://storage.example.com/assets/piano/factura.pdf",
      "mimetype": "application/pdf",
      "size": 524288
    },
    {
      "name": "Foto-frontal.jpg",
      "url": "https://storage.example.com/assets/piano/front.jpg",
      "mimetype": "image/jpeg",
      "size": 1048576
    }
  ],
  "notes": "Donado por la familia González"
}
```

## Listar bienes con filtros y búsqueda

`GET {{baseUrl}}/patrimony/assets`

Usa query params para acotar los resultados. El patrón Criteria aplica paginación (`page`, `perPage`), filtros directos (`congregationId`, `category`, `status`) y búsqueda textual (`search`) sobre nombre, código, responsable o ubicación.

```
{{baseUrl}}/patrimony/assets?
  page=1&
  perPage=10&
  congregationId=urn:church:central&
  status=ACTIVE&
  search=piano
```

La respuesta tiene formato de paginación estándar del proyecto:

```json
{
  "results": [
    {
      "assetId": "asset-123",
      "code": "BEM-000123",
      "name": "Piano Yamaha C3",
      "category": "instrument",
      "acquisitionDate": "2024-04-15T00:00:00.000Z",
      "value": 48000,
      "congregationId": "urn:church:central",
      "location": "Salón principal",
      "responsibleId": "urn:user:music-director",
      "status": "ACTIVE",
      "attachments": [
        {
          "attachmentId": "urn:attachment:1",
          "name": "Factura.pdf",
          "url": "https://storage.example.com/assets/piano/factura.pdf",
          "mimetype": "application/pdf",
          "size": 524288,
          "uploadedAt": "2024-04-16T02:31:00.000Z"
        }
      ],
      "history": [
        {
          "action": "CREATED",
          "performedBy": "urn:user:admin",
          "performedAt": "2024-04-16T02:31:00.000Z",
          "notes": "Donado por la familia González",
          "changes": {
            "name": { "current": "Piano Yamaha C3" },
            "category": { "current": "instrument" },
            "value": { "current": 48000 }
          }
        }
      ],
      "documentsPending": false,
      "createdAt": "2024-04-16T02:31:00.000Z",
      "updatedAt": "2024-04-16T02:31:00.000Z"
    }
  ],
  "count": 3,
  "page": 1,
  "perPage": 10,
  "nextPag": 2
}
```

## Consultar un bien específico

`GET {{baseUrl}}/patrimony/assets/:assetId`

Solo necesitas sustituir `:assetId` por el identificador interno (`assetId`). Ideal para revisar la ficha completa durante auditorías.

```
GET {{baseUrl}}/patrimony/assets/asset-123
```

## Actualizar datos o anexos

`PUT {{baseUrl}}/patrimony/assets/:assetId`

Permite corregir información, mover el bien a otra congregación o cargar nuevos anexos (máximo 3). Cualquier cambio queda registrado en el historial con el usuario autenticado.

```json
{
  "name": "Piano Yamaha C3X",
  "location": "Auditorio",
  "responsibleId": "urn:user:new-director",
  "status": "ACTIVE",
  "attachments": [
    {
      "name": "Inventario-2024.pdf",
      "url": "https://storage.example.com/assets/piano/inventario.pdf",
      "mimetype": "application/pdf",
      "size": 734003
    }
  ],
  "notes": "Traslado aprobado en comité 2024-Q3"
}
```

## Generar reporte de inventario

`GET {{baseUrl}}/patrimony/assets/report/inventory`

Genera un resumen en CSV o PDF. Usa los mismos filtros de la lista para segmentar por congregación, categoría o estado. El parámetro `format` acepta `csv` o `pdf`.

```
{{baseUrl}}/patrimony/assets/report/inventory?
  format=pdf&
  congregationId=urn:church:central&
  category=instrument
```

> El endpoint devuelve el archivo en el cuerpo de la respuesta con los encabezados correspondientes (`Content-Type: application/pdf` o `text/csv`). Guarda el archivo desde Postman seleccionando "Save Response".

---

Con estos ejemplos podrás armar rápidamente una colección en Postman que cubra el MVP patrimonial (Fase 1) y validar tanto flujos de alta como de consulta y reportes.
