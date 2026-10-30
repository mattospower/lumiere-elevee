# Lumière Élevée na Vercel

O repositório está preparado para uma implantação estática. O site é servido diretamente de `dist/`, com HTML, CSS, módulos JavaScript, imagens e fontes locais. Não exige dependências, compilação, funções de servidor ou variáveis de ambiente.

## Importação pelo GitHub

1. No painel da Vercel, acesse **Add New → Project**.
2. Importe `mattospower/lumiere-elevee`.
3. Confira as opções abaixo antes de autorizar a implantação.

| Opção | Valor |
| --- | --- |
| Production Branch | `main` |
| Root Directory | Raiz do repositório, `.` |
| Framework Preset | `Other` |
| Build Command | Vazio |
| Install Command | Vazio |
| Output Directory | `dist` |
| Environment Variables | Nenhuma |

O arquivo `vercel.json`, na raiz, define o framework, os comandos vazios e o diretório de saída. Os campos de instalação e compilação estão vazios porque o conteúdo de `dist/` já é o site final.

Apenas os arquivos de `dist/` são servidos pelo site. O histórico `historico.bundle` e os documentos continuam disponíveis no GitHub. Para envios pela Vercel CLI, `.vercelignore` também exclui esses materiais e os arquivos locais de hospedagem.

## Acesso privado

A proteção da hospedagem atual pertence à plataforma ChatGPT e não é transferida para a Vercel. O login interno da loja é demonstrativo e não restringe o acesso ao site.

Para manter uma implantação na Vercel privada, configure **Deployment Protection** com um escopo que cubra também o domínio de produção antes de publicar. O escopo **Standard Protection** deixa o domínio de produção público; confira as opções de proteção disponíveis no seu plano.

Esta preparação altera os arquivos do repositório. Ela não cria um projeto na Vercel nem realiza uma implantação; a hospedagem privada existente continua independente.

## Navegação e conferência

O projeto usa rotas com `#`, como `/#/catalogo` e `/#/produto/serum-lumiere`. O servidor recebe a requisição de `/`, e o JavaScript seleciona a tela pelo fragmento. Isso permite atualizar a página de um produto sem uma regra de reescrita para os arquivos estáticos.

Após uma implantação autorizada, confira:

- Página inicial, imagens e fontes.
- Catálogo com 18 produtos e pesquisa.
- Página de produto e atualização da página mantendo a rota com `#`.
- Inclusão, alteração e remoção de itens da sacola.
- Cupom `LUMIERE10` e checkout com os dados fictícios do botão de exemplo.
- Pagamento demonstrativo, revisão e confirmação.
- Temas claro/escuro e menu em uma tela de celular.

Os pagamentos e o login continuam demonstrativos. Sacola, tema e favoritos são armazenados por domínio no navegador; o endereço da Vercel terá dados locais próprios, separados dos da hospedagem atual.

## Execução local

Na raiz do repositório, execute:

```bash
python -m http.server 8080 --directory dist
```

Abra `http://localhost:8080`. Essa execução utiliza os mesmos arquivos estáticos selecionados pelo `outputDirectory` da configuração da Vercel.

## Referências oficiais

- [Configuração com vercel.json](https://vercel.com/docs/project-configuration/vercel-json)
- [Configuração de build](https://vercel.com/docs/builds/configure-a-build)
- [Arquivos ignorados pela CLI](https://vercel.com/docs/builds/build-features#ignored-files-and-folders)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
