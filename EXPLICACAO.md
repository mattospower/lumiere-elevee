# Como explicar o Lumière Élevée em aula

## 1. O que o projeto faz

Lumière Élevée é uma loja virtual acadêmica de skincare de luxo. A identidade é própria: nome, tons de bege e verde, detalhes dourados e tipografia consistente. A referência de e-commerce está na organização das etapas, sem copiar a identidade do Mercado Livre.

Tudo funciona com HTML, CSS e JavaScript puros. Nenhum pagamento, cadastro comercial ou envio é realizado. O projeto usa dados fictícios e arquivos locais.

## 2. Estrutura do projeto

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `dist/index.html` | Define o documento, o idioma, o viewport e as áreas de cabeçalho, conteúdo, rodapé e modal. |
| `dist/css/estilos.css` | Define variáveis de cores, componentes, temas e media queries. |
| `dist/css/fontes.css` e `fontes/` | Carregam Cormorant Garamond e Jost a partir de arquivos locais. |
| `dist/js/produtos.js` | Guarda as seis categorias e os 18 produtos em arrays de objetos. |
| `dist/js/carrinho.js` | Concentra cálculos e alterações da sacola, sem depender do HTML. |
| `dist/js/pagamentos.js` | Define dados de exemplo e validações didáticas. |
| `dist/js/app.js` | Monta as telas, reage aos cliques e formulários e coordena a navegação. |
| `dist/js/tema-inicial.js` | Restaura o tema salvo antes de mostrar a página. |
| `dist/img/` | Contém fotos originais e SVGs conceituais locais. |

O diretório `dist` foi mantido porque já era a pasta configurada na hospedagem. Não existe compilação: os arquivos dentro dela são o código-fonte do site.

## 3. Como funciona o fluxo de compra

1. Na home, a pessoa escolhe uma coleção ou abre o catálogo.
2. O catálogo usa os objetos de `produtos.js` para mostrar imagem, descrição e preço.
3. O link de detalhes contém o ID do produto, por exemplo `#/produto/serum-lumiere`.
4. Ao adicionar um produto, a sacola guarda ID, tamanho e quantidade. O preço é consultado no catálogo.
5. A sacola permite aumentar, diminuir e remover. O resumo recalcula produtos, frete, cupom e total.
6. O checkout valida os oito campos fictícios e a ciência dos termos.
7. No pagamento, um radio escolhe débito, crédito, PIX ou boleto. Apenas os campos necessários aparecem.
8. A revisão mostra os dados e valores. Uma mudança na sacola ou no cupom exige nova revisão do pagamento.
9. Ao confirmar, o site cria um número demonstrativo, salva o resumo do pedido e limpa a sacola.

## 4. Funções principais em linguagem simples

| Arquivo e função | O que explicar |
| --- | --- |
| `app.js` — `navegar` | Lê o caminho depois de `#` e escolhe qual tela colocar em `main`. Evita avançar com sacola vazia ou dados inválidos. |
| `app.js` — `telaCatalogo` | Filtra o array por categoria, pesquisa e faixa de preço; depois pode ordenar. |
| `app.js` — `telaProduto` | Usa o ID da URL para encontrar um produto e desenhar os detalhes. |
| `app.js` — `incluirProduto` | Chama a regra de adição, salva o estado, atualiza o contador e mostra um aviso. |
| `carrinho.js` — `adicionarAoCarrinho` | Acrescenta um produto ou soma a quantidade quando ID e tamanho já existem. |
| `carrinho.js` — `normalizarCarrinho` | Ignora registros inválidos e limita a quantidade a 20 por opção. |
| `carrinho.js` — `alterarQuantidade` | Mantém o mínimo de 1 e o máximo de 20. |
| `carrinho.js` — `removerDoCarrinho` | Produz uma nova lista sem o item selecionado. |
| `app.js` — `renderizarCarrinho` | Mostra itens, preços unitários, subtotais, botões e mensagem de sacola vazia. |
| `carrinho.js` — `calcularResumo` | Soma preço em centavos × quantidade, calcula frete e desconto e retorna o total. |
| `carrinho.js` — `formatarPreco` | Divide os centavos por 100 somente para exibir com `toLocaleString`, no formato brasileiro. |
| `carrinho.js` — `calcularParcelas` | Divide o total em parcelas inteiras e deixa o ajuste dos centavos na última. |
| `carrinho.js` — `descreverParcelas` | Monta a frase mostrada no select e na confirmação. |
| `pagamentos.js` — `validarCliente` | Retorna um objeto de erros para nome, e-mail, telefone, CPF fictício, CEP, endereço, cidade, estado e termos. |
| `pagamentos.js` — `validarCartao` | Aceita somente o número e o CVV fictícios indicados e verifica o formato de validade. Não faz validação bancária. |
| `app.js` — `mostrarErrosFormulario` | Coloca as mensagens junto dos campos, marca `aria-invalid` e foca o primeiro problema. |
| `pagamentos.js` — `criarCodigoPix` | Gera um texto de demonstração que não segue o padrão de um PIX real. |
| `app.js` — `copiarPix` | Copia esse texto; se a área de transferência estiver bloqueada, seleciona para cópia manual. |
| `app.js` — `salvarEstado` | Usa `JSON.stringify` para gravar sacola, favoritos, rotina e cupom no `localStorage`. |
| `app.js` — `salvarCheckout` | Guarda o rascunho do cliente no `sessionStorage`, sem incluir cartão. |
| `app.js` — `confirmarPedido` | Confere as etapas, cria o pedido de exemplo, salva apenas itens/valores/pagamento e limpa a sacola. |

### Exemplo de cálculo em centavos

Um Bálsamo Opaline custa `31000` centavos. Duas unidades somam `62000`. Com uma unidade e cupom de 10%: `31000 − 3100 + 2500 = 30400`, exibidos como **R$ 304,00**.

Em 12 parcelas: onze parcelas de `2533` centavos e a última de `2537`. A soma é exatamente `30400`. O select mostra o ajuste para que o usuário saiba o valor da última parcela.

### Armazenamento e privacidade

- `localStorage`: permanece após recarregar ou fechar o navegador; é usado para sacola, tema, favoritos, rotina, cupom e último pedido fictício.
- `sessionStorage`: mantém a conta demo e o rascunho do checkout na sessão da aba.
- Dados do cartão não são armazenados nem enviados. O último pedido não inclui endereço, CPF, telefone ou e-mail.
- Nenhuma senha é salva. O login da loja é uma simulação, sem autenticação real.

## 5. Oito perguntas possíveis do professor

1. **Por que separar HTML, CSS e JavaScript?** O HTML estrutura, o CSS apresenta e o JavaScript define o comportamento; a separação facilita manutenção.
2. **Por que usar um array de objetos para os produtos?** Cada objeto reúne os dados de um produto e o array permite percorrer, buscar, filtrar e ordenar sem duplicar conteúdo.
3. **Como a página sabe qual produto mostrar?** O ID está no trecho da URL depois de `#`; `navegar` encaminha para `telaProduto`, que consulta o catálogo.
4. **Por que calcular em centavos?** Para evitar pequenas imprecisões de números decimais nos cálculos financeiros.
5. **Como o parcelamento fecha no valor correto?** A divisão usa centavos inteiros e a diferença fica na última parcela.
6. **A validação verifica CPF ou cartão reais?** Não. O CPF aceito é todo zero e o cartão aceita apenas o número e o CVV fictícios da demonstração; não há banco ou API financeira.
7. **Por que a sacola continua depois de recarregar?** Os itens são convertidos em JSON e salvos no `localStorage`; na abertura, o código lê e normaliza essa lista.
8. **Para que servem os commits?** Cada commit registra uma etapa lógica da evolução do projeto e permite consultar as diferenças sem apagar o histórico anterior.

## 6. Roteiro de demonstração

1. Apresente **nome e proposta**: loja acadêmica de skincare de luxo, com identidade própria e sem vendas reais.
2. Mostre a **home**: banner, logo tipográfico, cores, categorias e destaques.
3. Abra uma **categoria** e aponte os três produtos. Mostre busca, filtro e preço em reais.
4. Abra um **produto** pelo ID, escolha tamanho e quantidade e adicione à sacola.
5. Na **sacola**, aponte imagem, nome, preço unitário, quantidade e subtotal.
6. **Aumente, diminua e remova** itens. Explique o mínimo de 1 e mostre o estado vazio; use os itens de exemplo para continuar.
7. Mostre o **total**, o frete e o cupom `LUMIERE10`. Recarregue para demonstrar a persistência.
8. No **checkout**, tente avançar vazio para mostrar as mensagens. Use dados fictícios e marque a ciência dos termos.
9. No **débito**, use o cartão fictício. No **crédito**, escolha 12 parcelas e explique o ajuste. No **PIX**, mostre o QR ilustrativo e copie o código sem valor. Conclua uma das opções.
10. Na **confirmação**, aponte número, resumo, forma de pagamento e sacola limpa.
11. Abra os **trechos de código**: `produtos.js`, `calcularResumo`, `calcularParcelas`, `validarCliente` e os eventos de formulário em `app.js`.
12. Mostre **Git e commits** com `git log --oneline`. No GitHub, abra https://github.com/mattospower/lumiere-elevee. Para mostrar os nove commits originais, clone o arquivo historico.bundle conforme o README; o histórico da importação no GitHub é separado.

## 7. Antes da aula

Execute o site por Live Server ou pelo comando do README. Leia as funções, ensaie os exemplos e use somente dados fictícios. O pacote contém o histórico Git para recuperação. O destino público autorizado é https://github.com/mattospower/lumiere-elevee. O site hospedado continua privado. O bundle mantém o histórico original, que pode ser recuperado para a apresentação.
