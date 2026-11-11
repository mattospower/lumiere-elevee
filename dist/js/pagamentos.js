// Campos e validações locais do checkout. A cobrança depende de um provedor de pagamento.
export const camposCliente = [
  "name", "email", "phone", "cpf", "cep", "address", "city", "state",
];

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
  shipping: "Envio padrão",
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
  for (const campo of camposCliente) {
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
    erros.name = "Informe seu nome com pelo menos 3 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim()))
    erros.email =
      "Informe um e-mail válido, como nome@exemplo.com.";
  if (!/^\d{10,11}$/.test(dados.phone.replace(/\D/g, "")))
    erros.phone = "Informe um telefone com DDD e 10 ou 11 dígitos.";
  if (!/^\d{11}$/.test(dados.cpf.replace(/\D/g, "")))
    erros.cpf = "Informe um CPF com 11 dígitos.";
  if (!/^\d{8}$/.test(dados.cep.replace(/\D/g, "")))
    erros.cep = "Informe um CEP com 8 dígitos.";
  if (dados.address.trim().length < 5)
    erros.address =
      "Informe o endereço com pelo menos 5 caracteres.";
  if (dados.city.trim().length < 2)
    erros.city = "Informe sua cidade.";
  if (!estados.includes(dados.state)) erros.state = "Selecione um estado.";
  if (!dados.terms)
    erros.terms =
      "Leia e aceite os Termos de Uso para continuar.";
  return erros;
}
