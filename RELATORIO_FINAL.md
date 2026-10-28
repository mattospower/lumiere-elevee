# Relatório final — Lumière Élevée

Data: 28 de outubro de 2026. Projeto acadêmico de loja virtual, com dados fictícios e hospedagem privada.

## 1. Resumo do que foi feito

A identidade do Lumière Élevée e os recursos existentes foram preservados.
O catálogo passou a ter 18 produtos em seis coleções, com imagens locais.
O checkout foi completado, com validação e etapas de identificação, pagamento, revisão e confirmação.
Débito, crédito em até 12 parcelas e PIX foram implementados como simulações, sem dados bancários reais.
O código foi organizado e comentado em português; a documentação e o histórico Git fazem parte da entrega.

URL privada: https://lumiere-elevee.fuzzypoppy132.chatgpt.site

## 2. Tabela por critério técnico

| Critério | Situação antes | O que foi alterado | Situação agora |
| --- | --- | --- | --- |
| 1. Estrutura e organização | Código e recursos concentrados em `dist` e `assets`. | Separação em `css/`, `js/`, `img/` e fontes locais; atualização dos caminhos. | Atendido. O site continua em `dist`, sem compilação. |
| 2. Identidade visual e design | Identidade própria, paleta, tipografia e fotos do projeto. | Preservação do nome, logo tipográfico, cores, banner, temas e apresentação; SVGs conceituais para novos itens. | Atendido no projeto; sem identidade do Mercado Livre. |
| 3. Home e produtos | Cinco produtos e coleções com poucos itens. | 18 produtos, seis coleções com três itens cada, dados em `produtos.js` e detalhes por ID. | Atendido; os 18 detalhes e suas imagens foram verificados. |
| 4. Navegação e usabilidade | Navegação, busca, avisos e contador existentes. | Etapas claras de compra, bloqueios de avanço e menu mobile preservado; categorias também visíveis na home mobile. | Atendido nos fluxos verificados. |
| 5. Carrinho | Adição, quantidade, remoção e persistência existentes; informação unitária incompleta e cálculos em reais. | Módulo de regras, centavos inteiros, preço unitário/subtotal, limites e normalização dos dados. | Atendido, incluindo vazio, mínimo, máximo, remoção e recarga. |
| 6. Checkout | Somente nome, e-mail e endereço. | Telefone, CPF fictício, CEP, cidade, estado, termos, mensagens por campo, resumo e confirmação. | Atendido; sacola vazia bloqueia o checkout. |
| 7. Pagamentos | Opções visuais de cartão, PIX e boleto. | Radios de débito/crédito/PIX, campos fictícios, validação, 1–12 parcelas, QR ilustrativo e cópia do código PIX. Boleto preservado. | Atendido como simulação, sem integração financeira. |
| 8. HTML, CSS e JS | HTML semântico, mas código compacto e pouco comentado. | Formatação, comentários, funções com nomes em português, módulos separados e remoção do script inline de tema. | Atendido; sintaxe verificada e nenhum erro do site observado no console. |
| 9. Git e GitHub | Histórico inicial existente; documentação ausente. | Commits por etapa, `.gitignore`, README e pacote com histórico recuperável por bundle. | Git atendido. Destino público autorizado: mattospower/lumiere-elevee; importação de arquivos com histórico original no bundle. |
| 10. Responsividade | Desktop e 390 px haviam sido verificados na versão anterior. | Ajustes nos formulários, cards, botões, subtotais e navegação; nova verificação em 360, 768 e 1280 px. | Atendido nos viewports testados em Chrome; sem rolagem horizontal nas telas verificadas. |

Critério 11, apresentação: `EXPLICACAO.md` contém estrutura, fluxo, funções, oito perguntas com respostas e roteiro de demonstração. O desempenho oral e a nota dependem do aluno e do professor.

## 3. Arquivos criados, alterados e reorganizados

| Ação | Arquivos |
| --- | --- |
| Criados | `.gitignore`, `README.md`, `EXPLICACAO.md`, `RELATORIO_FINAL.md`. |
| Módulos criados | `dist/js/carrinho.js`, `dist/js/pagamentos.js`, `dist/js/tema-inicial.js`. |
| Alterado | `dist/index.html`: caminhos atualizados e JavaScript de tema em arquivo separado. |
| Reorganizado e alterado | `dist/app.js` → `dist/js/app.js`; telas, regras de avanço, eventos, formulários e comentários. |
| Reorganizado e ampliado | `dist/data.js` → `dist/js/produtos.js`; catálogo e preços em centavos. |
| Reorganizado e alterado | `dist/style.css` → `dist/css/estilos.css`; comentários, campos, erros e responsividade. |
| Reorganizados | `dist/assets/fonts.css` → `dist/css/fontes.css`; oito fontes de `assets/fonts/` → `css/fontes/`. |
| Imagens preservadas e movidas | `ampola.png`, `balsamo.png`, `creme.png`, `ritual.png`, `serum.png`, `solar.png`: de `assets/` para `img/`. |
| SVGs criados | `agua-micelar-purete.svg`, `balsamo-noturno.svg`, `elixir-de-ceramidas.svg`, `espuma-de-seda.svg`, `essencia-perolada.svg`, `fluido-solar-com-cor.svg`, `kit-cuidado-diurno.svg`, `kit-ritual-essencial.svg`, `kit-ritual-noturno.svg`, `nectar-noturno.svg`, `oleo-serum-dourado.svg`, `pos-sol-calmante.svg`, `veu-de-agua.svg`, `qr-demo.svg`, em `dist/img/`. |
| Preservados | `AUDITORIA.md`, com o diagnóstico inicial, e a identidade/configuração da hospedagem. |
| Removidos do resultado final | Os caminhos antigos após a reorganização e a página temporária de validação responsiva. Nenhuma funcionalidade existente foi retirada. |

Não há arquivos de teste, dependências de desenvolvimento, prints de debug ou credenciais no pacote de código entregue. As verificações foram executadas fora da árvore final ou diretamente no navegador.

## 4. Commits realizados

A saída abaixo foi registrada antes do commit deste relatório. O histórico completo, incluindo a finalização, está no bundle e pode ser consultado com `git log --oneline`. O commit inicial não foi reescrito e suas datas foram preservadas.

```text
4b9acd0 Documenta execução e prepara roteiro de apresentação em aula
7cbe9e3 Refina validação e preserva pedidos anteriores da demonstração
270fe4e Comenta funções em português e ajusta formulários para celular
f568afd Completa checkout e pagamentos fictícios com validação e parcelas
7fdb946 Amplia catálogo e centraliza regras da sacola em centavos
26b4ed4 Organiza pastas css, js e img sem alterar a identidade visual
7f96cdd Corrige cálculos em centavos e registra auditoria da atividade
a3740ad Update Site source
```

## 5. Checklist do enunciado

- ✔ HTML, CSS e JavaScript puros; sem frameworks, CDN ou imagens hotlinkadas.
- ✔ Pastas organizadas e caminhos locais válidos.
- ✔ Identidade própria e consistente, paleta em variáveis CSS e fontes locais.
- ✔ Home com categorias, busca, destaques, produtos e rodapé.
- ✔ Seis categorias e 18 produtos; no mínimo três itens em cada categoria.
- ✔ Imagem, nome, descrição, preço em reais e detalhes por ID.
- ✔ Navegação, menu mobile, contador e avisos de interação.
- ✔ Adição na listagem e nos detalhes; quantidade de 1 a 20; remoção e estado vazio.
- ✔ Preço unitário, quantidade, subtotal e total; regras monetárias em centavos inteiros.
- ✔ Sacola persistente após navegação e recarga.
- ✔ Oito campos do cliente, labels, validações e mensagens claras.
- ✔ Checkout bloqueado com sacola vazia; resumo visível durante a compra.
- ✔ Débito, crédito e PIX com radio buttons; apenas campos da opção ativa.
- ✔ Campos fictícios do cartão; número e CVV exclusivamente demonstrativos.
- ✔ Crédito de 1 a 12 parcelas; ajuste explícito da última parcela.
- ✔ PIX com código fictício copiável, QR ilustrativo e instruções.
- ✔ Avisos de simulação; nenhuma cobrança, consulta bancária ou coleta de cartão para processamento.
- ✔ Confirmação com número, resumo e forma de pagamento; sacola limpa.
- ✔ HTML semântico, `alt`, labels, `lang`, title e viewport.
- ✔ Código organizado, funções comentadas em português e documentação para apresentação.
- ✔ Commits pequenos por etapa; histórico anterior preservado e README completo.
- ✔ Verificação de responsividade em 360, 768 e 1280 px.
- ✔ Hospedagem mantida privada; nenhuma ativação de site público ou GitHub Pages.
- ✔ Destino GitHub indicado e publicação pública autorizada: mattospower/lumiere-elevee. O arquivo historico.bundle preserva os nove commits originais; o histórico de importação no GitHub é separado.
- ✔ Repositório público autorizado para consulta do professor; o site hospedado permanece privado.
- ? Apresentação oral e pontuação: dependem da avaliação em aula.

## 6. Testes executados e resultados

| Teste | Resultado observado |
| --- | --- |
| Sintaxe dos cinco arquivos JS | Aprovada por `node --check`. |
| Dados e arquivos locais | 18 IDs únicos; seis coleções com três produtos; todos os arquivos de imagem referenciados existem. |
| Detalhes dos 18 produtos | Todos abriram, com imagem carregada e sem rolagem horizontal em 1280 px. |
| Fluxo home → categoria → produto → sacola | Aprovado em 360 px; preço e dados do produto corretos. |
| Quantidade mínima | Botão de diminuir desativado em 1; regra também verificada isoladamente. |
| Quantidade máxima e dados inválidos | Limite de 20, descarte de IDs inexistentes e quantidades inválidas, verificados nas regras. |
| Alterar quantidade e frete | Um Bálsamo: R$ 310,00 + R$ 25,00 = R$ 335,00; dois: R$ 620,00 com frete grátis. |
| Limite do frete | Em R$ 450,00, frete grátis; em R$ 449,99, R$ 25,00, verificados nas regras. |
| Cupom | Um Bálsamo com LUMIERE10: R$ 310,00 − R$ 31,00 + R$ 25,00 = R$ 304,00. |
| Recarregar com itens | Itens e resumo preservados; teste com recarga real da URL da sacola. |
| Remover o último item | Mostra sacola vazia e remove o botão de avançar. |
| Abrir checkout vazio pela URL | Redireciona para `#/sacola`; nenhum formulário de compra é exibido. |
| Campos vazios no checkout | Nove avisos: oito campos e ciência dos termos; primeiro campo recebe foco. |
| Dados de exemplo e validação | Preenchimento fictício funciona; mensagens anteriores são limpas; CPF fora do exemplo é rejeitado. |
| Crédito em 360 px | Campos vazios bloqueiam; cartão fictício permite revisão e confirmação. |
| Crédito em 12 parcelas | Para R$ 304,00: 11 × R$ 25,33 + R$ 25,37; valor preservado na revisão e confirmação. |
| Soma de parcelas de 1 a 12 | Todas somam exatamente o total em centavos; quantidades inválidas são rejeitadas. |
| Débito em 768 px | Select de parcelas ausente; cartão fictício, revisão e confirmação à vista por R$ 1.540,00. |
| PIX em 1280 px | Campos de cartão ausentes; QR ilustrativo; código fictício copiado e confirmação por R$ 1.540,00. |
| Área de transferência do PIX | Conteúdo confirmado: `LUMIERE-DEMO-SEM-VALOR-154000-NAO-PAGAR`. |
| Boleto preservado | Revisão e confirmação demonstrativas concluídas, sem emissão de boleto. |
| Confirmação e limpeza da sacola | Número e resumo presentes; contador retorna a zero. |
| Busca e filtro | Busca sem acento por “serum” com preço acima de R$ 400 retornou três produtos. |
| Favoritos, conta e rotina | Novo produto salvo nos favoritos e na rotina; login demo e conta funcionam. |
| Temas e recarga | Modo escuro preservado após recarregar; termos com seis seções legíveis. |
| Menu tablet e catálogo | Em 768 px, menu abriu e levou ao catálogo com 18 produtos. |
| Responsividade | Sem overflow horizontal nas telas verificadas em 360, 768 e 1280 px. |
| Compatibilidade com pedido anterior | Registro antigo convertido de reais para centavos; registro inválido ignorado. |
| Console | Nenhum erro ou aviso associado ao código do site nos dois contextos de teste. |

As validações visuais foram feitas em Chrome, com viewports de teste em iframe e uma aba direta para recarga e navegação. Não substituem testes em aparelhos físicos ou em todos os navegadores. A independência de serviços externos foi verificada nos caminhos e no código; não houve teste de desconexão física da rede.

## 7. Extras implementados e preservados

Três grupos documentados: busca/filtros; cupom LUMIERE10; modo claro/escuro. Não foram acrescentados novos grupos de extras antes de completar os itens obrigatórios de código.

Favoritos, Minha Rotina, quiz, conta demo, artigos, páginas institucionais e boleto demonstrativo foram preservados do projeto existente. A manutenção desses recursos respeita a exigência de não remover funcionalidades.

## 8. Pendências e próximos passos do aluno

1. Consultar https://github.com/mattospower/lumiere-elevee. O repositório foi indicado pelo usuário e a publicação pública do código foi autorizada. Para recuperar o histórico original, use historico.bundle e os comandos do README.
2. Compartilhar a URL pública do repositório com o professor, se desejado. Nenhum convite ou mensagem foi enviado automaticamente; o site hospedado permanece privado.
3. Ler `EXPLICACAO.md`, estudar as funções e ensaiar o roteiro com dados fictícios.
4. Abrir o projeto por Live Server ou pelo servidor local do README.
5. Para uso comercial futuro, validar formulações, textos, avaliações, imagens e condições legais. A loja entregue é acadêmica e não processa vendas reais.

As fotos originais disponíveis foram mantidas. Os novos produtos usam imagens conceituais locais; as fotografias mais recentes do protótipo Figma não foram recuperadas nesta etapa.
