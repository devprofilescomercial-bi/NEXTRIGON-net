export type Lawyer = {
  id: string;
  name: string;
  area: string;
  tags: string[];
  city: string;
  uf: string;
  rating: number;
  reviews: number;
  reason: string;
  verified: boolean;
  initials: string;
  grad: [string, string];
  mutual?: boolean;
};

export const lawyers: Lawyer[] = [
  {
    id: "1", name: "Dra. Marina Alves", area: "Direito Penal",
    tags: ["Tribunal do Júri", "Recursos", "Habeas Corpus"],
    city: "São Paulo", uf: "SP", rating: 4.9, reviews: 27,
    reason: "Atua em Direito Penal a 12 km · responde em ~2h",
    verified: true, initials: "MA", grad: ["#fb923c", "#ea580c"], mutual: true,
  },
  {
    id: "2", name: "Dr. Rafael Costa", area: "Direito Tributário",
    tags: ["Planejamento", "Execução Fiscal", "Aduaneiro"],
    city: "Campinas", uf: "SP", rating: 4.8, reviews: 41,
    reason: "Especialista tributário · 41 projetos concluídos",
    verified: true, initials: "RC", grad: ["#60a5fa", "#2563eb"],
  },
  {
    id: "3", name: "Dra. Helena Dias", area: "Direito Trabalhista",
    tags: ["Reclamatórias", "Compliance", "Sindical"],
    city: "Guarulhos", uf: "SP", rating: 4.7, reviews: 33,
    reason: "Mesma comarca · taxa de resposta 96%",
    verified: true, initials: "HD", grad: ["#34d399", "#059669"],
  },
  {
    id: "4", name: "Dr. Bruno Tavares", area: "Direito Empresarial",
    tags: ["Societário", "Contratos", "M&A"],
    city: "São Paulo", uf: "SP", rating: 4.9, reviews: 58,
    reason: "Top reputação · 58 avaliações · responde em ~1h",
    verified: true, initials: "BT", grad: ["#c084fc", "#7c3aed"],
  },
  {
    id: "5", name: "Dra. Lúcia Pereira", area: "Direito de Família",
    tags: ["Divórcio", "Inventário", "Guarda"],
    city: "Santo André", uf: "SP", rating: 4.6, reviews: 19,
    reason: "Atua na sua região · perfil verificado",
    verified: true, initials: "LP", grad: ["#f472b6", "#db2777"],
  },
];
