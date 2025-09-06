// Lista expandida de universidades brasileiras
export interface University {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'federal' | 'estadual' | 'municipal' | 'privada';
  acronym: string;
}

export const universities: University[] = [
  // Universidades Federais
  { id: 'ufrj', name: 'Universidade Federal do Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', type: 'federal', acronym: 'UFRJ' },
  { id: 'usp', name: 'Universidade de São Paulo', city: 'São Paulo', state: 'SP', type: 'federal', acronym: 'USP' },
  { id: 'unb', name: 'Universidade de Brasília', city: 'Brasília', state: 'DF', type: 'federal', acronym: 'UnB' },
  { id: 'ufmg', name: 'Universidade Federal de Minas Gerais', city: 'Belo Horizonte', state: 'MG', type: 'federal', acronym: 'UFMG' },
  { id: 'ufpr', name: 'Universidade Federal do Paraná', city: 'Curitiba', state: 'PR', type: 'federal', acronym: 'UFPR' },
  { id: 'ufrgs', name: 'Universidade Federal do Rio Grande do Sul', city: 'Porto Alegre', state: 'RS', type: 'federal', acronym: 'UFRGS' },
  { id: 'ufba', name: 'Universidade Federal da Bahia', city: 'Salvador', state: 'BA', type: 'federal', acronym: 'UFBA' },
  { id: 'ufpe', name: 'Universidade Federal de Pernambuco', city: 'Recife', state: 'PE', type: 'federal', acronym: 'UFPE' },
  { id: 'ufc', name: 'Universidade Federal do Ceará', city: 'Fortaleza', state: 'CE', type: 'federal', acronym: 'UFC' },
  { id: 'ufg', name: 'Universidade Federal de Goiás', city: 'Goiânia', state: 'GO', type: 'federal', acronym: 'UFG' },
  { id: 'ufam', name: 'Universidade Federal do Amazonas', city: 'Manaus', state: 'AM', type: 'federal', acronym: 'UFAM' },
  { id: 'ufpa', name: 'Universidade Federal do Pará', city: 'Belém', state: 'PA', type: 'federal', acronym: 'UFPA' },
  { id: 'ufrn', name: 'Universidade Federal do Rio Grande do Norte', city: 'Natal', state: 'RN', type: 'federal', acronym: 'UFRN' },
  { id: 'ufal', name: 'Universidade Federal de Alagoas', city: 'Maceió', state: 'AL', type: 'federal', acronym: 'UFAL' },
  { id: 'ufs', name: 'Universidade Federal de Sergipe', city: 'Aracaju', state: 'SE', type: 'federal', acronym: 'UFS' },
  { id: 'ufes', name: 'Universidade Federal do Espírito Santo', city: 'Vitória', state: 'ES', type: 'federal', acronym: 'UFES' },
  { id: 'ufms', name: 'Universidade Federal de Mato Grosso do Sul', city: 'Campo Grande', state: 'MS', type: 'federal', acronym: 'UFMS' },
  { id: 'ufmt', name: 'Universidade Federal de Mato Grosso', city: 'Cuiabá', state: 'MT', type: 'federal', acronym: 'UFMT' },
  { id: 'unifesp', name: 'Universidade Federal de São Paulo', city: 'São Paulo', state: 'SP', type: 'federal', acronym: 'UNIFESP' },
  { id: 'ufabc', name: 'Universidade Federal do ABC', city: 'Santo André', state: 'SP', type: 'federal', acronym: 'UFABC' },

  // Universidades Estaduais
  { id: 'uerj', name: 'Universidade do Estado do Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', type: 'estadual', acronym: 'UERJ' },
  { id: 'unesp', name: 'Universidade Estadual Paulista', city: 'São Paulo', state: 'SP', type: 'estadual', acronym: 'UNESP' },
  { id: 'unicamp', name: 'Universidade Estadual de Campinas', city: 'Campinas', state: 'SP', type: 'estadual', acronym: 'UNICAMP' },
  { id: 'uem', name: 'Universidade Estadual de Maringá', city: 'Maringá', state: 'PR', type: 'estadual', acronym: 'UEM' },
  { id: 'uel', name: 'Universidade Estadual de Londrina', city: 'Londrina', state: 'PR', type: 'estadual', acronym: 'UEL' },
  { id: 'uepg', name: 'Universidade Estadual de Ponta Grossa', city: 'Ponta Grossa', state: 'PR', type: 'estadual', acronym: 'UEPG' },
  { id: 'uece', name: 'Universidade Estadual do Ceará', city: 'Fortaleza', state: 'CE', type: 'estadual', acronym: 'UECE' },
  { id: 'uepb', name: 'Universidade Estadual da Paraíba', city: 'Campina Grande', state: 'PB', type: 'estadual', acronym: 'UEPB' },
  { id: 'uefs', name: 'Universidade Estadual de Feira de Santana', city: 'Feira de Santana', state: 'BA', type: 'estadual', acronym: 'UEFS' },
  { id: 'uesc', name: 'Universidade Estadual de Santa Cruz', city: 'Ilhéus', state: 'BA', type: 'estadual', acronym: 'UESC' },

  // Universidades Privadas
  { id: 'puc-rio', name: 'Pontifícia Universidade Católica do Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', type: 'privada', acronym: 'PUC-Rio' },
  { id: 'puc-sp', name: 'Pontifícia Universidade Católica de São Paulo', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'PUC-SP' },
  { id: 'puc-mg', name: 'Pontifícia Universidade Católica de Minas Gerais', city: 'Belo Horizonte', state: 'MG', type: 'privada', acronym: 'PUC-MG' },
  { id: 'puc-pr', name: 'Pontifícia Universidade Católica do Paraná', city: 'Curitiba', state: 'PR', type: 'privada', acronym: 'PUC-PR' },
  { id: 'puc-rs', name: 'Pontifícia Universidade Católica do Rio Grande do Sul', city: 'Porto Alegre', state: 'RS', type: 'privada', acronym: 'PUC-RS' },
  { id: 'mackenzie', name: 'Universidade Presbiteriana Mackenzie', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'Mackenzie' },
  { id: 'fiap', name: 'Faculdade de Informática e Administração Paulista', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'FIAP' },
  { id: 'fecap', name: 'Fundação Escola de Comércio Álvares Penteado', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'FECAP' },
  { id: 'fmu', name: 'Faculdades Metropolitanas Unidas', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'FMU' },
  { id: 'unip', name: 'Universidade Paulista', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'UNIP' },
  { id: 'anhanguera', name: 'Universidade Anhanguera', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'Anhanguera' },
  { id: 'estacio', name: 'Universidade Estácio de Sá', city: 'Rio de Janeiro', state: 'RJ', type: 'privada', acronym: 'Estácio' },
  { id: 'uninove', name: 'Universidade Nove de Julho', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'UNINOVE' },
  { id: 'unicesumar', name: 'Universidade Cesumar', city: 'Maringá', state: 'PR', type: 'privada', acronym: 'UNICESUMAR' },
  { id: 'unifor', name: 'Universidade de Fortaleza', city: 'Fortaleza', state: 'CE', type: 'privada', acronym: 'UNIFOR' },

  // Centros Universitários
  { id: 'unifacs', name: 'Universidade Salvador', city: 'Salvador', state: 'BA', type: 'privada', acronym: 'UNIFACS' },
  { id: 'unifor', name: 'Universidade de Fortaleza', city: 'Fortaleza', state: 'CE', type: 'privada', acronym: 'UNIFOR' },
  { id: 'unifor', name: 'Centro Universitário de Belo Horizonte', city: 'Belo Horizonte', state: 'MG', type: 'privada', acronym: 'UNI-BH' },
  { id: 'unifor', name: 'Centro Universitário de Brasília', city: 'Brasília', state: 'DF', type: 'privada', acronym: 'UniCEUB' },
  { id: 'unifor', name: 'Centro Universitário de Curitiba', city: 'Curitiba', state: 'PR', type: 'privada', acronym: 'UniCuritiba' },
  { id: 'unifor', name: 'Centro Universitário de Goiás', city: 'Goiânia', state: 'GO', type: 'privada', acronym: 'UniGoiás' },
  { id: 'unifor', name: 'Centro Universitário de Manaus', city: 'Manaus', state: 'AM', type: 'privada', acronym: 'UniManaus' },
  { id: 'unifor', name: 'Centro Universitário de Recife', city: 'Recife', state: 'PE', type: 'privada', acronym: 'UniRecife' },
  { id: 'unifor', name: 'Centro Universitário de Salvador', city: 'Salvador', state: 'BA', type: 'privada', acronym: 'UniSalvador' },
  { id: 'unifor', name: 'Centro Universitário de São Paulo', city: 'São Paulo', state: 'SP', type: 'privada', acronym: 'UniSP' },

  // Faculdades Regionais
  { id: 'fatec', name: 'Faculdade de Tecnologia de São Paulo', city: 'São Paulo', state: 'SP', type: 'estadual', acronym: 'FATEC-SP' },
  { id: 'fatec-rio', name: 'Faculdade de Tecnologia do Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', type: 'estadual', acronym: 'FATEC-RJ' },
  { id: 'fatec-mg', name: 'Faculdade de Tecnologia de Minas Gerais', city: 'Belo Horizonte', state: 'MG', type: 'estadual', acronym: 'FATEC-MG' },
  { id: 'fatec-pr', name: 'Faculdade de Tecnologia do Paraná', city: 'Curitiba', state: 'PR', type: 'estadual', acronym: 'FATEC-PR' },
  { id: 'fatec-rs', name: 'Faculdade de Tecnologia do Rio Grande do Sul', city: 'Porto Alegre', state: 'RS', type: 'estadual', acronym: 'FATEC-RS' },
  { id: 'fatec-ba', name: 'Faculdade de Tecnologia da Bahia', city: 'Salvador', state: 'BA', type: 'estadual', acronym: 'FATEC-BA' },
  { id: 'fatec-pe', name: 'Faculdade de Tecnologia de Pernambuco', city: 'Recife', state: 'PE', type: 'estadual', acronym: 'FATEC-PE' },
  { id: 'fatec-ce', name: 'Faculdade de Tecnologia do Ceará', city: 'Fortaleza', state: 'CE', type: 'estadual', acronym: 'FATEC-CE' },
  { id: 'fatec-go', name: 'Faculdade de Tecnologia de Goiás', city: 'Goiânia', state: 'GO', type: 'estadual', acronym: 'FATEC-GO' },
  { id: 'fatec-am', name: 'Faculdade de Tecnologia do Amazonas', city: 'Manaus', state: 'AM', type: 'estadual', acronym: 'FATEC-AM' },
];

// Função para buscar universidades por estado
export const getUniversitiesByState = (state: string): University[] => {
  return universities.filter(uni => uni.state === state);
};

// Função para buscar universidades por tipo
export const getUniversitiesByType = (type: 'federal' | 'estadual' | 'municipal' | 'privada'): University[] => {
  return universities.filter(uni => uni.type === type);
};

// Função para buscar universidade por ID
export const getUniversityById = (id: string): University | undefined => {
  return universities.find(uni => uni.id === id);
};
