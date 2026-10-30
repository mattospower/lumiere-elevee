# Lumière Élevée — Loja virtual demonstrativa

Projeto acadêmico de Criação de Sites com identidade própria de skincare de luxo. Simula a navegação por produtos, a sacola e o processo completo de compra, sem cobrança ou entrega real.

Site privado: https://lumiere-elevee.fuzzypoppy132.chatgpt.site

O acesso à hospedagem exige a conta ChatGPT autorizada. O login dentro da loja é uma conta de demonstração, independente dessa proteção. O site não foi disponibilizado publicamente.

## Tecnologias e execução

HTML, CSS e JavaScript puros; Git para versionamento. Não há frameworks, bibliotecas de execução, instalação de pacotes ou etapa de compilação. Imagens e fontes estão no projeto.

O diretório `dist/` contém o próprio site, editável e pronto para servir. O nome foi mantido para preservar a configuração de hospedagem existente.

A pasta `.openai/` pertence à configuração da hospedagem privada e fica fora deste repositório. Ela não é necessária para executar o site com Live Server ou com o servidor local abaixo.

1. Abra a pasta do projeto no VS Code.
2. Use **Live Server** em `dist/index.html`.
3. Alternativamente, com Python instalado, execute na raiz:

```bash
python -m http.server 8080 --directory dist
```

Abra `http://localhost:8080`. Depois de obter os arquivos, esse servidor funciona sem internet: as imagens, fontes e scripts são locais. Abra por um servidor local; o duplo clique em `index.html` pode bloquear os módulos JavaScript por usar o protocolo `file://`.

## Preparação para a Vercel

O repositório inclui `vercel.json`, configurado para servir `dist/` com o preset `Other`, sem instalar pacotes ou executar uma compilação. Importe `mattospower/lumiere-elevee` mantendo a raiz do repositório como **Root Directory**. Consulte [VERCEL.md](VERCEL.md) para as opções do painel, a navegação e a proteção de acesso antes de publicar.

A configuração da Vercel não depende de `.openai/`. A hospedagem privada existente permanece independente desta preparação.

## Funcionalidades

- 18 produtos em seis coleções, com três produtos por coleção.
- Home, coleções, catálogo, detalhes por ID, sacola, identificação, pagamento, revisão e confirmação.
- Sacola com preço unitário, quantidade de 1 a 20, subtotal, remoção, estado vazio e persistência.
- Valores financeiros em centavos inteiros, inclusive desconto e ajuste da última parcela.
- Checkout com nome, e-mail, telefone, CPF fictício, CEP, endereço, cidade e estado; mensagens junto aos campos e resumo de erros.
- Débito e crédito fictícios; crédito de 1 a 12 parcelas sem juros; PIX com código copiável e QR ilustrativo. O boleto demonstrativo do projeto anterior foi preservado.
- Confirmação com número do pedido, itens, frete, desconto, total e forma de pagamento; a sacola é limpa após confirmar.
- Bloqueio das etapas da compra com sacola vazia e revisão vinculada à seleção atual de produtos/cupom.
- Layout responsivo, menu mobile, navegação por teclado e temas claro/escuro.
- Login demo, favoritos, Minha Rotina, quiz de navegação, artigos e páginas institucionais preservados.

## Dados para demonstração

Use **PREENCHER DADOS FICTÍCIOS** no checkout e marque a ciência dos termos. O CPF aceito é somente `000.000.000-00`.

Para débito ou crédito, use **USAR CARTÃO FICTÍCIO**:

| Campo | Exemplo |
| --- | --- |
| Número | `0000 0000 0000 0000` |
| Nome | `CLIENTE DEMO` |
| Validade | `12/30` |
| CVV | `000` |

O número e o CVV aceitos são exclusivamente fictícios. Não há Luhn, autorização bancária, emissão de boleto ou integração financeira. O QR Code e o texto do PIX não são pagáveis. Nunca informe dados bancários reais.

Para o login demo, use `isabella@example.com` e uma senha fictícia de pelo menos seis caracteres, como `lumiere`. Nenhuma senha é salva ou enviada.

A sacola começa vazia para novos visitantes. Na sacola vazia há o botão **CARREGAR ITENS DE EXEMPLO**, que recupera a demonstração com os três produtos originais.

## Estrutura

```text
dist/
  index.html
  css/
    estilos.css          # layout, cores e responsividade
    fontes.css           # fontes locais
    fontes/              # arquivos de fonte
  js/
    app.js               # telas, eventos, navegação e armazenamento
    produtos.js          # catálogo único e textos institucionais
    carrinho.js          # regras da sacola, valores e parcelas
    pagamentos.js        # validações e dados fictícios
    tema-inicial.js      # restaura o tema antes de renderizar
  img/                   # fotos originais e SVGs ilustrativos locais
README.md
EXPLICACAO.md
AUDITORIA.md              # diagnóstico inicial preservado
RELATORIO_FINAL.md        # critérios, verificações e pendências
PUBLICACAO_GITHUB.md      # importação e histórico original
VERCEL.md                 # importação e configuração na Vercel
vercel.json               # publicação estática de dist/
.vercelignore             # exclusões nos envios pela CLI
```

As cinco imagens de produtos e o banner originais foram preservados. Os treze produtos complementares usam SVGs locais identificados como visuais conceituais. Conteúdos de fórmulas, benefícios e avaliações são ilustrativos do projeto, sem oferta comercial.

## Armazenamento

`localStorage` mantém sacola, favoritos, rotina, cupom, tema e último pedido de exemplo. `sessionStorage` mantém a conta demo e o rascunho do checkout. O último pedido salva apenas itens, valores, parcelas e forma de pagamento; não salva contatos, CPF, endereço ou cartão. Os campos de número, validade e CVV do cartão nunca são persistidos. O rodapé permite limpar os dados demonstrativos, preservando o tema.

Nenhuma parte do fluxo faz requisições para processar os formulários. Não há analytics, scripts de CDN ou hotlinks de imagens no código.

## Extras e recursos preservados

Os três grupos de extras documentados são: **busca/filtros**, **cupom** e **modo escuro**. O cupom `LUMIERE10` aplica 10% aos produtos; o frete demonstrativo é gratuito a partir de R$ 450,00 e custa R$ 25,00 abaixo disso. Não há juros.

Favoritos, rotina, quiz, conta demo, artigos e boleto já existiam e foram mantidos para não remover funcionalidades. Nenhum novo grupo de extras foi acrescentado ao escopo obrigatório.

## Git e GitHub

**Repositório público autorizado:** https://github.com/mattospower/lumiere-elevee

A autorização para tornar o código público não altera o acesso ao site hospedado: ele continua privado.

O código foi importado pela integração de arquivos do GitHub. Os nove commits originais, com hashes, autores, datas e mensagens preservados, estão no arquivo `historico.bundle`. Eles não são substituídos pelos commits de importação exibidos no GitHub. Para consultar o histórico original completo, execute `git clone historico.bundle lumiere-elevee-original` e depois `git log --oneline` nessa cópia.

O histórico anterior foi preservado e as alterações foram separadas em commits lógicos, com mensagens em português. Consulte:

```bash
git log --oneline
git status
```

O repositório de hospedagem privada recebe o código da versão entregue. O repositório de destino foi indicado pelo usuário e a visibilidade pública foi autorizada explicitamente. Nenhum outro repositório da conta foi alterado.

Para futuras atualizações, use o repositório indicado. Na cópia clonada do bundle, adicione o destino abaixo; antes de enviar, integre o histórico de importação do GitHub e resolva eventuais diferenças, sem sobrescrever commits:

```bash
git remote add github https://github.com/mattospower/lumiere-elevee.git
git fetch github
git merge github/main --allow-unrelated-histories
git push -u github main
```

Se o remoto `github` já existir, use `git remote set-url github <URL_CORRETA>`. Não use `--force`. Não envie o projeto para um repositório que já contenha outro trabalho.

O pacote de entrega inclui `historico.bundle`. Para recuperar o repositório com todos os commits:

```bash
git clone historico.bundle lumiere-elevee
cd lumiere-elevee
```

Nesse caso, o remoto `origin` aponta para o arquivo bundle; adicione o remoto `github` conforme os comandos acima. O professor pode consultar o repositório público. Não ative GitHub Pages nem torne o site hospedado público sem nova autorização.

## Apresentação e validação

Leia `EXPLICACAO.md` para o roteiro, as funções e oito perguntas com respostas. `RELATORIO_FINAL.md` registra os testes, os critérios e os limites da entrega. A nota e a avaliação oral dependem do professor e da apresentação do aluno; a documentação não garante pontuação.
