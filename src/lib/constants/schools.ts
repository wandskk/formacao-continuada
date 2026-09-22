/**
 * Escolas e unidades da Rede Municipal de Ensino de Baraúna/RN
 * Base de dados oficial da SME Baraúna para padronização e evitar variações nos relatórios do MEC.
 */
export const BARAUNA_MUNICIPAL_SCHOOLS: string[] = [
  "Centro Municipal de Educação de Jovens e Adultos (CEJAB)",
  "Escola Municipal de 1º Grau Joana Timóteo",
  "Escola Municipal de 1º Grau Olavo Bilac",
  "Escola Municipal de 1º Grau Francisco Virgínio",
  "Escola Municipal de 1º Grau Manoel de Barros",
  "Escola Municipal de 1º Grau João Gama",
  "Escola Municipal Antônio Martins da Costa",
  "Escola Municipal de 1º Grau Amaro Cavalcante",
  "Escola Municipal de 1º Grau Higino Roberto",
  "Escola Municipal de 1º Grau Manoel Cosme",
  "Escola Municipal de 1º Grau Miguel Marques",
  "Escola Municipal de 1º Grau Pedro Fernandes",
  "Escola Municipal de 1º Grau Professora Maria Barros Feitosa",
  "Escola Municipal de 1º Grau Rui Barbosa",
  "Escola Municipal de 1º Grau Professora Maria Lindalva",
  "Escola Municipal de 1º Grau Prof. Amauri Ribeiro da Silva",
  "Creche Municipal Ana Monteiro Reinaldo",
  "Creche Municipal Aprendizado do Angicos",
  "Creche Municipal Arco Íris",
  "Creche Municipal Carrossel",
  "Creche Municipal Construindo Nova Vida",
  "Creche Municipal Flor do Campo",
  "Creche Municipal Nedja Nara Rocha Cláudio",
  "Creche Municipal Sol Nascente",
  "Secretaria Municipal de Educação (Sede Administrativa)",
];

/**
 * Cargos e funções prioritárias do programa Pró-Alfa RN e alfabetização
 */
export const DEFAULT_PRO_ALFA_ROLES: string[] = [
  "Professor(a)",
  "Profissional de Apoio",
  "Professor do AEE",
  "Profissional da Biblioteca",
];

/**
 * Trilhas formativas padrão do Pró-Alfa RN
 */
export const DEFAULT_PRO_ALFA_TRACKS: string[] = [
  "Professores de 1º e 2º",
  "Professores de 3º e 5º",
];

/**
 * Texto institucional padrão para a 2ª Edição do Pró-Alfa RN
 */
export const DEFAULT_PRO_ALFA_NOTICE = `A Secretaria Municipal de Educação de Baraúna/RN em parceria com a Secretaria de Estado da Educação, do Esporte e do Lazer do Rio Grande do Norte – SEEC/RN, realiza a presente inscrição dos professores para participação nas ações de formação continuada vinculadas ao Pró-Alfa RN.
A formação é destinada aos profissionais da educação envolvidos com os processos de alfabetização e recomposição das aprendizagens nos anos iniciais do Ensino Fundamental.
O preenchimento deste formulário é necessário para fins de inscrição, organização das turmas, acompanhamento da participação e emissão/registro de certificação, conforme as regras da formação.`;

/**
 * Converte string separada por quebras de linha ou vírgulas em array de opções limpas
 */
export function parseOptionsList(raw?: string | null): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
