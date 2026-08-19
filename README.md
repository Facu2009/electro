# Gestión de Stock de Componentes Electrónicos

Aplicación web para administrar el inventario de componentes electrónicos.
Acceso para cualquier usuario registrado en Firebase.

## Stack

- **Frontend:** React 18 (hooks + componentes funcionales) + React Router.
- **Backend:** Python 3 + Flask (API REST).
- **Base de datos:** Firebase Firestore.
- **Autenticación:** Firebase Authentication.

## Estructura del proyecto

```
├── backend/
│   ├── app.py                    # Entrada de Flask (fábrica + seed categorías)
│   ├── config.py                 # Configuración central
│   ├── requirements.txt
│   ├── core/                     # Infraestructura (db, auth, errores)
│   ├── models/                   # Esquemas y validación (Component, Category)
│   ├── routes/                   # Blueprints de la API
│   └── services/                 # Lógica de negocio
└── frontend/
    ├── src/
    │   ├── App.js                # Router + rutas protegidas
    │   ├── config/firebase.js    # Inicialización de Firebase
    │   ├── context/AuthContext.js
    │   ├── hooks/useInventory.js
    │   ├── services/             # Cliente HTTP + servicios de dominio
    │   └── components/           # Login, Dashboard, formularios, CRUD
    └── public/
```

## Modelo de datos (Firestore)

**Colección `components`:**
| Campo | Tipo | Obligatorio |
|---|---|---|
| `name` | string | Sí |
| `specs` | string (especificaciones técnicas) | Sí |
| `category` | string | Sí (debe existir) |
| `stock` | int (>= 0) | Sí |
| `price` | float (> 0) | Sí |

**Colección `categories`:** `{ name: string }` (único).

## Configuración e instalación

### 1. Crear el proyecto Firebase

1. Web: https://console.firebase.google.com → "Agregar proyecto".
2. **Authentication** → Sign-in method → habilitar **Email/Password** → crea los
   usuarios que quieras (todos los registrados podrán acceder).
3. **Firestore Database** → "Crear base de datos" (modo producción).
4. **Reglas de Firestore** → establece seguridad (el backend accede con cuenta de servicio).
5. **Configuración del proyecto → Cuentas de servicio** → "Generar nueva clave
   privada" y guarda el JSON.

### 2. Backend (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Copia la plantilla y pega tu clave privada de la cuenta de servicio:
copy firebase_service_account.example.json firebase_service_account.json
copy .env.example .env         # ajusta CORS_ORIGINS si es necesario

python app.py                  # http://localhost:5000
```

Al arrancar crea automáticamente las categorías iniciales:
Capacitores, Resistencias, Circuitos, Transistores, Borneras y Diodos.

### 3. Frontend (React)

```bash
cd frontend
npm install

copy .env.example .env         # completa con los valores de tu app web de Firebase
npm start                      # http://localhost:3000
```

## Endpoints de la API

Todas las rutas requieren la cabecera `Authorization: Bearer <idToken>` de un
usuario registrado en Firebase.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Valida el token y la sesión del usuario |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/<id>` | Actualizar categoría |
| DELETE | `/api/categories/<id>` | Eliminar (bloqueado si está en uso) |
| GET | `/api/components` | Listar componentes (`?category=`) |
| POST | `/api/components` | Crear componente |
| PUT | `/api/components/<id>` | Actualizar componente |
| DELETE | `/api/components/<id>` | Eliminar componente |
| PATCH | `/api/components/<id>/stock` | Ajustar stock `{ "delta": 5 }` |
| PATCH | `/api/components/<id>/price` | Actualizar precio `{ "price": 12.5 }` |

## Funcionalidades

- Login obligatorio para cualquier usuario registrado en Firebase.
- Páginas dedicadas: gestión de categorías y componentes + una página por cada categoría y componente.
- CRUD de categorías (con las 6 iniciales precreadas).
- CRUD de componentes con stock y precio.
- Control rápido de stock (+/-) y edición de precio.

## Despliegue gratuito en Render (accesible en todo el mundo)

El proyecto está listo para Render: el `Dockerfile` multi-etapa compila el
frontend y arma el backend en un solo contenedor que sirve API + interfaz con
HTTPS automático. El plan gratuito de Render **no requiere tarjeta de
crédito** y alcanza para uso de inventario.

### 1. Prerrequisitos

- Cuenta de [GitHub](https://github.com) (gratuita) y del proyecto subido allí.
- El JSON de la cuenta de servicio de Firebase (ya tenés
  `backend/firebase_service_account.json`).

### 2. Preparar la clave como variable de entorno

Render pide el valor en una sola línea, así que conviene pasarla en **base64**
(el backend ya lo acepta con el prefijo `base64:`). En PowerShell:

```powershell
# Desde la carpeta del backend
$b64 = "base64:" + [Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase_service_account.json"))
$b64 | Set-Content var_firebase.txt -NoNewline
# Abrí var_firebase.txt y copiá TODO su contenido (empieza con "base64:")
notepad var_firebase.txt
```

### 3. Crear el servicio en Render

1. Entrá a <https://dashboard.render.com> → **New** → **Web Service**
   y conectá tu cuenta de GitHub.
2. Elegí el repositorio del proyecto. Render detecta el `Dockerfile` solo.
3. Configuración:
   - **Name:** `inventario-electronico`
   - **Region:** la más cercana (eg. Frankfurt u Oregon).
   - **Instance Type:** Free.
4. En **Environment** agregá la variable:
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = el contenido de `var_firebase.txt`
     (el JSON en base64 con prefijo `base64:`).
5. **Create Web Service**. En unos minutos queda desplegado con una URL tipo
   `https://inventario-electronico.onrender.com`.

### 4. Verificar

Abrí la URL en cualquier dispositivo: login, categorías y componentes
funcionando desde cualquier lugar del mundo.

**Notas:**
- El plan gratuito "duerme" el servidor tras ~15 min de inactividad; el primer
  ingreso después de dormirse tarda ~1 min en despertar (es normal).
- El contenedor lee la clave de servicio desde `FIREBASE_SERVICE_ACCOUNT_JSON`
  (JSON plano o base64). El seed de categorías corre solo la primera vez.
- Para actualizar tras cambios: pusheá a GitHub y Render vuelve a desplegar solo
  (o usá **Manual Deploy**).
- `var_firebase.txt` contiene tu clave de servicio: **no lo subas a GitHub**.

## Modo producción local (API + interfaz en un solo servidor)

Para usarla como el antiguo empaquetado, pero corriendo desde el código:

```bash
# 1. Compilar el frontend (genera frontend/build)
cd frontend
npm install
npm run build

# 2. Levantar el backend (sirve API y el frontend compilado en :5000)
cd ..\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Abrí `http://localhost:5000`. Tras un cambio de código repetí el paso 1 (o
`npm run build`) y reiniciá el servidor. El backend sirve el frontend
compilado desde `frontend/build` (ver `resolve_frontend_build()` en
`backend/config.py`).