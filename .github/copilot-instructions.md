# Copilot Instructions

## Contexto de la Aplicación

### Descripción General
Ropabase es una aplicación frontend desarrollada con **Next.js** y **TypeScript**. Su propósito principal es gestionar ropa y accesorios, permitiendo a los usuarios realizar operaciones como agregar, actualizar y eliminar elementos de ropa. La aplicación está estructurada en diferentes páginas y componentes reutilizables.

### Estructura del Proyecto
- **Páginas**:
  - `/src/app/login/page.tsx`: Página de inicio de sesión.
  - `/src/app/register/page.tsx`: Página de registro.
  - `/src/app/dashboard/page.tsx`: Página principal del usuario.
- **Componentes**:
  - `Navbar.tsx`: Barra de navegación.
  - Componentes de UI reutilizables como `button.tsx`, `card.tsx`, `dialog.tsx`, etc.
- **Contexto**:
  - `AuthContext.tsx`: Manejo de la autenticación del usuario.
- **Hooks**:
  - Hooks personalizados para gestionar elementos de ropa (`useAddClothingItem`, `useClothingItems`, etc.).
- **Librerías**:
  - `api.ts`: Funciones para interactuar con la API.
  - `utils.ts`: Utilidades generales.

### Configuración
- **Configuración de ESLint**: `eslint.config.mjs`.
- **Configuración de TypeScript**: `tsconfig.json`.
- **Configuración de PostCSS**: `postcss.config.mjs`.
- **Configuración de Next.js**: `next.config.ts`.

### Dependencias Clave
- **React**: Para la construcción de interfaces de usuario.
- **Next.js**: Framework para aplicaciones web.
- **TypeScript**: Tipado estático.

---

## Plan de Acción
1. **Entender el Requerimiento**: Analizar la solicitud del usuario y confirmar los detalles.
2. **Planificación**: Dividir la tarea en pasos pequeños y manejables.
3. **Ejecución**: Implementar los cambios necesarios en el código.
4. **Revisión**: Verificar que los cambios cumplen con los requisitos y no introducen errores.
5. **Confirmación**: Preguntar al usuario si desea proceder con los cambios realizados.

---

## Preguntas para Confirmar
- ¿El plan propuesto cumple con tus expectativas?
- ¿Hay algún detalle adicional que deba considerar antes de proceder?
- ¿Deseas que implemente los cambios ahora o necesitas más aclaraciones?

---

## Explicación Detallada de los Cambios

Cada vez que se realicen cambios en el proyecto, se proporcionará una explicación detallada que incluirá:

1. **Contexto del Cambio**: ¿Por qué se realizó el cambio? ¿Qué problema resuelve o qué funcionalidad agrega?
2. **Descripción del Cambio**: Detalles específicos sobre lo que se modificó, agregó o eliminó en el código.
3. **Impacto del Cambio**: ¿Cómo afecta el cambio al sistema? ¿Qué partes del proyecto podrían verse influenciadas?
4. **Pruebas Realizadas**: ¿Qué pruebas se llevaron a cabo para garantizar que el cambio funciona correctamente y no introduce errores?

**Nota**: Esta explicación detallada se incluirá en cada interacción para garantizar que el usuario comprenda completamente los cambios realizados.

---

## Estructura Recomendada para Testing

### ¿Por qué esta estructura?

1. **Escalabilidad**: Los tests están organizados cerca de los componentes que prueban, facilitando el mantenimiento cuando el proyecto crece.
2. **Cobertura Efectiva**: Cada componente tiene sus propios tests, lo que permite alcanzar y mantener un buen nivel de cobertura.
3. **Mantenibilidad**: Los desarrolladores saben dónde encontrar tests relacionados con un componente específico.
4. **Best Practices**: Sigue convenciones de la comunidad React/Next.js.

### Estructura de Carpetas

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx
│   │   └── __tests__/
│   │       └── page.test.tsx
│   ├── register/
│   │   ├── page.tsx
│   │   └── __tests__/
│   │       └── page.test.tsx
│   └── dashboard/
│       ├── page.tsx
│       └── __tests__/
│           └── page.test.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Button.tsx
│   ├── __tests__/
│   │   ├── Navbar.test.tsx
│   │   └── Button.test.tsx
│   └── ui/
│       ├── card.tsx
│       ├── button.tsx
│       └── __tests__/
│           ├── card.test.tsx
│           └── button.test.tsx
├── context/
│   ├── AuthContext.tsx
│   └── __tests__/
│       └── AuthContext.test.tsx
└── hooks/
    ├── clothing/
    │   ├── useAddClothingItem.ts
    │   └── __tests__/
    │       └── useAddClothingItem.test.ts
```

### Mejores Prácticas para Testing

1. **Estructura de Tests (AAA Pattern)**:
   - **Arrange**: Prepara el estado inicial y los mocks necesarios.
   - **Act**: Ejecuta la acción que deseas probar.
   - **Assert**: Verifica que los resultados son los esperados.

2. **Mocking**:
   - Mock de contextos (`useAuth`, etc.) para aislar componentes.
   - Mock de módulos externos (`next/image`, `next/link`).
   - Mock de funciones async para control de timing.

3. **Naming de Tests**:
   - Describe qué debe hacer el componente, no cómo lo hace.
   - Ejemplo: ✅ "debería deshabilitar el formulario mientras se está enviando" ❌ "debe establecer isLoading a true".

4. **Cobertura de Código**:
   - Enfócate en rutas críticas (flujos de usuario importantes).
   - No intentes alcanzar 100% de cobertura; 50-80% es más sostenible.
   - Prioriza tests que previenen bugs reales.

5. **Testing Library Best Practices**:
   - Usa `userEvent` en lugar de `fireEvent` para simulaciones más realistas.
   - Consulta elementos como los usuarios lo hacen (por rol, etiqueta, etc.).
   - Evita consultar por `data-testid` a menos que sea absolutamente necesario.

### Archivos de Configuración

- **jest.config.js**: Configuración principal de Jest con soporte para TypeScript, módulos, y umbrales de cobertura.
- **jest.setup.js**: Configuración de Testing Library y extensiones personalizadas.
- **package.json**: Scripts para ejecutar tests (`npm run test`, `npm run test:watch`).