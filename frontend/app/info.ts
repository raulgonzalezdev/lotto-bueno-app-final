import { Inter, Plus_Jakarta_Sans, Open_Sans, PT_Mono } from "next/font/google";

// Configuración de fuentes con opciones disponibles verificadas
const inter = Inter({ subsets: ["latin"] });
const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const open_sans = Open_Sans({ subsets: ["latin"] });
const pt_mono = PT_Mono({ subsets: ["latin"], weight: "400" });

export type FontKey = "Inter" | "Plus_Jakarta_Sans" | "Open_Sans" | "PT_Mono";

export const fonts: Record<FontKey, typeof inter> = {
  Inter: inter,
  Plus_Jakarta_Sans: plus_jakarta_sans,
  Open_Sans: open_sans,
  PT_Mono: pt_mono,
};

export const chat_interface_info =
  process.env.NEXT_PUBLIC_CHAT_INTERFACE_INFO ||
  "Utiliza la Interfaz de Chat para interactuar con tus datos. Tu consulta será utilizada para recuperar información relevante y construir una respuesta. Puedes elegir entre diferentes Modelos de Lenguaje de Gran Tamaño (LLM) para crear una respuesta.";

export const chunk_interface_info =
  process.env.NEXT_PUBLIC_CHUNK_INTERFACE_INFO ||
  "Utiliza la Interfaz de Fragmentos para navegar por partes relevantes de tus datos, basadas en tu última consulta. Puedes elegir entre diferentes técnicas de incrustación y recuperación.";

export const document_interface_info =
  process.env.NEXT_PUBLIC_DOCUMENT_INTERFACE_INFO ||
  "Utiliza el Visor de Documentos para inspeccionar tus datos y los extractos de contexto que se utilizaron para generar respuestas a tus consultas. Puedes alternar entre mostrar el documento completo y solo mostrar el extracto específico.";
