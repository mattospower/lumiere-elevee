// Regras da sacola. Todos os valores monetários são inteiros em centavos.
// Estas funções não alteram o HTML nem dependem de servidor.

export function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Descarta dados inválidos do navegador e mantém no máximo 20 unidades por opção.
export function normalizarCarrinho(dados, produtos) {
  if (!Array.isArray(dados)) return [];
  const carrinho = [];
  for (const item of dados) {
    if (!item || typeof item !== "object") continue;
    const produto = produtos.find((produto) => produto.id === item.id);
    if (!produto || !Number.isInteger(item.qty) || item.qty < 1) continue;
    const tamanho = produto.options.includes(item.size)
      ? item.size
      : produto.size;
    const existente = carrinho.find(
      (linha) => linha.id === item.id && linha.size === tamanho,
    );
    if (existente) existente.qty = Math.min(20, existente.qty + item.qty);
    else
      carrinho.push({
        id: produto.id,
        size: tamanho,
        qty: Math.min(20, item.qty),
      });
  }
  return carrinho;
}

export function adicionarAoCarrinho(
  carrinho,
  id,
  quantidade,
  tamanho,
  produtos,
) {
  const produto = produtos.find((produto) => produto.id === id);
  if (!produto || !Number.isInteger(quantidade) || quantidade < 1)
    return carrinho;
  return normalizarCarrinho(
    [...carrinho, { id, qty: quantidade, size: tamanho || produto.size }],
    produtos,
  );
}

export function alterarQuantidade(carrinho, indice, variacao) {
  return carrinho.map((item, posicao) =>
    posicao === indice
      ? { ...item, qty: Math.max(1, Math.min(20, item.qty + variacao)) }
      : item,
  );
}

export function removerDoCarrinho(carrinho, indice) {
  return carrinho.filter((item, posicao) => posicao !== indice);
}

export function calcularResumo(carrinho, produtos, cupomAtivo = false) {
  let subtotalCentavos = 0;
  let quantidade = 0;
  for (const item of carrinho) {
    const produto = produtos.find((produto) => produto.id === item.id);
    if (!produto) continue;
    subtotalCentavos += produto.precoCentavos * item.qty;
    quantidade += item.qty;
  }
  const freteCentavos =
    quantidade === 0 || subtotalCentavos >= 45000 ? 0 : 2500;
  const descontoCentavos = cupomAtivo
    ? Math.round((subtotalCentavos * 10) / 100)
    : 0;
  return {
    quantidade,
    subtotalCentavos,
    freteCentavos,
    descontoCentavos,
    totalCentavos: subtotalCentavos + freteCentavos - descontoCentavos,
  };
}

// O ajuste de centavos fica na última parcela. A soma sempre corresponde ao total.
export function calcularParcelas(totalCentavos, quantidade) {
  if (
    !Number.isInteger(totalCentavos) ||
    totalCentavos < 0 ||
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    quantidade > 12
  )
    return [];
  const valorBase = Math.floor(totalCentavos / quantidade);
  const parcelas = Array(quantidade).fill(valorBase);
  parcelas[quantidade - 1] = totalCentavos - valorBase * (quantidade - 1);
  return parcelas;
}

export function descreverParcelas(totalCentavos, quantidade) {
  const parcelas = calcularParcelas(totalCentavos, quantidade);
  if (!parcelas.length) return "";
  const ultima = parcelas[parcelas.length - 1];
  return (
    `${quantidade}x de ${formatarPreco(parcelas[0])}` +
    (ultima !== parcelas[0] ? ` (última ${formatarPreco(ultima)})` : "") +
    " sem juros"
  );
}

// Mantém pedidos de exemplo da versão anterior e ignora um registro corrompido.
export function restaurarPedido(dados, produtos) {
  if (!dados || !Array.isArray(dados.items) || !dados.items.length) return null;
  const antigo = dados.items.some((item) => item && "price" in item);
  const itens = dados.items
    .filter(
      (item) =>
        item &&
        produtos.some((produto) => produto.id === item.id) &&
        Number.isInteger(item.qty) &&
        item.qty > 0 &&
        item.qty <= 20,
    )
    .map((item) => ({
      id: item.id,
      size: typeof item.size === "string" ? item.size : "",
      qty: item.qty,
      precoCentavos: Number.isInteger(item.precoCentavos)
        ? item.precoCentavos
        : Math.round(item.price * 100),
    }));
  const totalCentavos = antigo ? Math.round(dados.total * 100) : dados.total;
  if (
    !itens.length ||
    itens.some(
      (item) => !Number.isInteger(item.precoCentavos) || item.precoCentavos < 0,
    ) ||
    !Number.isInteger(totalCentavos) ||
    totalCentavos < 0
  )
    return null;
  const pagamento =
    dados.payment === "Cartão" ? "Cartão de crédito" : dados.payment;
  return {
    id: String(dados.id || "LE-DEMO-ANTERIOR").slice(0, 60),
    items: itens,
    total: totalCentavos,
    freteCentavos: Number.isInteger(dados.freteCentavos)
      ? dados.freteCentavos
      : 0,
    descontoCentavos: Number.isInteger(dados.descontoCentavos)
      ? dados.descontoCentavos
      : 0,
    payment: [
      "Cartão de crédito",
      "Cartão de débito",
      "PIX",
      "Boleto",
    ].includes(pagamento)
      ? pagamento
      : "PIX",
    parcelas:
      Number.isInteger(dados.parcelas) &&
      dados.parcelas >= 1 &&
      dados.parcelas <= 12
        ? dados.parcelas
        : 6,
  };
}
