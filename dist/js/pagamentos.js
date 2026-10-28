// Validações didáticas: não há banco, API de pagamento, CPF real ou análise de crédito.
export const exemploCliente = {
  name: "Isabella Martins",
  email: "isabella@example.com",
  phone: "(00) 00000-0000",
  cpf: "000.000.000-00",
  cep: "00000-000",
  address: "Rua Exemplo, 100",
  city: "Cidade Exemplo",
  state: "RS",
};

export const dadosIniciaisCheckout = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  cep: "",
  address: "",
  city: "",
  state: "",
  terms: false,
  payment: "Cartão de crédito",
  parcelas: 6,
  shipping: "Padrão demonstrativo",
  assinaturaValidada: "",
};

export const metodosPagamento = [
  "Cartão de débito",
  "Cartão de crédito",
  "PIX",
  "Boleto",
];
export const estados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// Recupera somente campos conhecidos. Nunca inclua número, validade ou CVV aqui.
export function restaurarCheckout(dados) {
  const resultado = { ...dadosIniciaisCheckout };
  if (!dados || typeof dados !== "object") return resultado;
  for (const campo of Object.keys(exemploCliente)) {
    if (typeof dados[campo] === "string")
      resultado[campo] = dados[campo].slice(0, 160);
  }
  resultado.terms = dados.terms === true;
  if (metodosPagamento.includes(dados.payment))
    resultado.payment = dados.payment;
  if (
    Number.isInteger(dados.parcelas) &&
    dados.parcelas >= 1 &&
    dados.parcelas <= 12
  ) {
    resultado.parcelas = dados.parcelas;
  }
  if (typeof dados.assinaturaValidada === "string")
    resultado.assinaturaValidada = dados.assinaturaValidada;
  return resultado;
}

export function validarCliente(dados) {
  const erros = {};
  if (dados.name.trim().length < 3)
    erros.name = "Informe um nome fictício com pelo menos 3 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim()))
    erros.email =
      "Informe um e-mail de exemplo válido, como cliente@example.com.";
  if (!/^\d{10,11}$/.test(dados.phone.replace(/\D/g, "")))
    erros.phone = "Informe um telefone fictício com DDD e 10 ou 11 dígitos.";
  if (dados.cpf.replace(/\D/g, "") !== "00000000000")
    erros.cpf = "Nesta simulação, use apenas o CPF fictício 000.000.000-00.";
  if (!/^\d{8}$/.test(dados.cep.replace(/\D/g, "")))
    erros.cep = "Informe um CEP fictício com 8 dígitos, como 00000-000.";
  if (dados.address.trim().length < 5)
    erros.address =
      "Informe um endereço de exemplo com pelo menos 5 caracteres.";
  if (dados.city.trim().length < 2)
    erros.city = "Informe uma cidade de exemplo.";
  if (!estados.includes(dados.state)) erros.state = "Selecione um estado.";
  if (!dados.terms)
    erros.terms =
      "Marque que leu os termos e entendeu que esta compra é simulada.";
  return erros;
}

// Aceitamos apenas o número e o CVV de demonstração; não fazemos validação bancária.
export function validarCartao(dados) {
  const erros = {};
  if (!/^(0000 ){3}0000$/.test(dados.numero.trim()))
    erros.numero = "Use somente o número fictício 0000 0000 0000 0000.";
  if (dados.nome.trim().length < 3)
    erros.nome = "Informe um nome fictício com pelo menos 3 caracteres.";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(dados.validade.trim()))
    erros.validade = "Use o formato MM/AA, por exemplo 12/30.";
  if (dados.cvv !== "000") erros.cvv = "Use somente o CVV fictício 000.";
  return erros;
}

// O texto não segue o padrão de um Pix real e não permite transferência.
export function criarCodigoPix(totalCentavos) {
  return `LUMIERE-DEMO-SEM-VALOR-${totalCentavos}-NAO-PAGAR`;
}
