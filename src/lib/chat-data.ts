export type ChatContact = {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
  initials: string;
  grad: [string, string];
};

export const CHATS: ChatContact[] = [
  { id: "1", name: "Dra. Marina Alves",  last: "Claro. Segue a proposta para análise.", time: "09:42", unread: 2, initials: "MA", grad: ["#fb923c", "#ea580c"] },
  { id: "2", name: "Dr. Rafael Costa",   last: "Podemos fechar a parceria tributária?", time: "08:15", unread: 0, initials: "RC", grad: ["#60a5fa", "#2563eb"] },
  { id: "3", name: "Dra. Helena Dias",   last: "Documento enviado, qualquer coisa avise.", time: "Ontem", unread: 0, initials: "HD", grad: ["#34d399", "#059669"] },
  { id: "4", name: "Dr. Bruno Tavares",  last: "Excelente! Vou avaliar e te retorno.", time: "Ter",    unread: 0, initials: "BT", grad: ["#c084fc", "#7c3aed"] },
];
