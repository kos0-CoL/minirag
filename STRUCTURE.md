/**
 * Frontend Component Structure - Tree
 */

/*
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── chat/
│   │   ├── ChatWindow.tsx          // Vista principal del chat
│   │   ├── MessageList.tsx         // Lista de mensajes
│   │   ├── MessageBubble.tsx       // Burbuja individual
│   │   ├── InputArea.tsx           // Area de entrada
│   │   ├── MessageSources.tsx      // Mostrar fuentes
│   │   └── CacheIndicator.tsx      // Indicador de caché
│   │
│   ├── sidebar/
│   │   ├── Sidebar.tsx             // Sidebar principal
│   │   ├── ChatsList.tsx           // Lista de chats
│   │   ├── ChatItem.tsx            // Item individual
│   │   ├── NewChatButton.tsx       // Botón nuevo chat
│   │   └── SidebarToggle.tsx       // Toggle responsivo
│   │
│   ├── documents/
│   │   ├── DocumentUpload.tsx      // Upload de documentos
│   │   ├── DocumentsList.tsx       // Lista de documentos
│   │   ├── DocumentItem.tsx        // Item individual
│   │   ├── MetadataForm.tsx        // Form para metadatos
│   │   └── DocumentViewer.tsx      // Visor de documento
│   │
│   ├── agents/
│   │   ├── AgentSelector.tsx       // Dropdown de agentes
│   │   ├── AgentManager.tsx        // Gestor de agentes
│   │   ├── AgentForm.tsx           // Form crear/editar
│   │   └── AgentCard.tsx           // Card individual
│   │
│   ├── settings/
│   │   ├── SettingsPanel.tsx       // Panel de config
│   │   ├── ModelSelector.tsx       // Selector de modelo
│   │   ├── KSelector.tsx           // Selector de K resultados
│   │   ├── ModeSelector.tsx        // Selector de modo
│   │   ├── ThemeToggle.tsx         // Toggle tema
│   │   ├── ApiKeyForm.tsx          // Form Gemini API key
│   │   └── CacheSettings.tsx       // Config de caché
│   │
│   ├── common/
│   │   ├── Header.tsx              // Header principal
│   │   ├── Footer.tsx              // Footer
│   │   ├── Loader.tsx              // Loading spinner
│   │   ├── Modal.tsx               // Modal genérico
│   │   ├── Toast.tsx               // Toast notifications
│   │   ├── Badge.tsx               // Badge component
│   │   └── Button.tsx              // Button genérico
│   │
│   └── layout/
│       └── MainLayout.tsx          // Layout principal
│
├── hooks/
│   ├── useChat.ts                  // Hook para chat operations
│   ├── useDocuments.ts             // Hook para documentos
│   ├── useAgents.ts                // Hook para agentes
│   ├── useApi.ts                   // Hook para llamadas API
│   └── useNotification.ts          // Hook para notificaciones
│
├── store/
│   ├── useAppStore.ts              // Store principal (Zustand)
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── chatSlice.ts
│   │   ├── documentSlice.ts
│   │   └── uiSlice.ts
│   └── middleware/
│       └── persistMiddleware.ts
│
├── services/
│   ├── apiClient.ts                // Cliente HTTP
│   ├── geminiService.ts            // Integraciones Gemini
│   └── storageService.ts           // LocalStorage utils
│
├── types/
│   ├── index.ts                    // Tipos compartidos
│   ├── api.ts                      // Tipos de API
│   ├── entities.ts                 // Tipos de entidades
│   └── store.ts                    // Tipos de store
│
├── pages/
│   ├── HomePage.tsx                // Landing
│   ├── ChatPage.tsx                // Página principal de chat
│   ├── DocumentsPage.tsx           // Página de documentos
│   ├── AgentsPage.tsx              // Página de agentes
│   ├── SettingsPage.tsx            // Página de config
│   ├── LoginPage.tsx               // Login
│   ├── RegisterPage.tsx            // Registro
│   └── NotFoundPage.tsx            // 404
│
├── utils/
│   ├── formatters.ts               // Funciones formato
│   ├── validators.ts               // Validación
│   ├── constants.ts                // Constantes
│   └── helpers.ts                  // Funciones helpers
│
├── styles/
│   ├── globals.css                 // Global styles
│   ├── tailwind.css                // Tailwind config
│   └── variables.css               // CSS variables
│
├── App.tsx                         // App root
├── main.tsx                        // Entry point
├── vite-env.d.ts                   // Vite types
└── env.d.ts                        // Env types
*/

console.log('Frontend component structure defined');
