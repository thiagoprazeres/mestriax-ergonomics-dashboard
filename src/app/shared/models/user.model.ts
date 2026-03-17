export interface User {
  name: string;
  email: string;
  password: string;
  role: string;
  avatarUrl?: string;
}

export interface Company {
  name: string;
  slogan: string;
  phone: string;
  email: string;
  instagram: string;
}

export const COMPANY: Company = {
  name: 'Gestão de Risco Ergonômico',
  slogan: 'Cuidamos de pessoas, otimizamos processos, geramos valor.',
  phone: '(81) 98617-1458',
  email: 'mestriax@gmail.com',
  instagram: 'https://www.instagram.com/amestriax',
};
