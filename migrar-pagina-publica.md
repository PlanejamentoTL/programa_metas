# Tarefa: fazer a página pública de metas ler os dados direto do Firestore

## Contexto

Tenho dois sistemas que usam o **mesmo projeto Firebase**:

1. **Sistema de monitoramento (interno):** onde as metas são cadastradas e atualizadas. Usa Firebase com login e lê/grava no Firestore.
2. **Página pública (este projeto):** publicada no site da prefeitura, aberta a qualquer pessoa. Hoje ela lê os dados de uma **planilha do Google Sheets**, que eu atualizo à mão: exporto do sistema, reestruturo e colo na planilha.

Quero que a página pública passe a **ler os dados direto do Firestore, somente leitura**, e acabar com a etapa manual da planilha.

**Todos os dados das metas são públicos** e vão ser exibidos na página, então não preciso de uma coleção separada só com campos públicos.

## Antes de escrever código, leia

1. **`padrao-dados-firestore.md`**: descreve a estrutura das coleções e dos documentos no Firestore (nomes de campos, tipos e formatos). É a referência principal para o mapeamento dos dados. Se algo neste arquivo de tarefa entrar em conflito com ele, **siga o `padrao-dados-firestore.md`** e me avise do conflito.
2. **O código atual da página pública**, principalmente:
   - onde e como ela busca os dados do Google Sheets;
   - como os dados da planilha são transformados e usados nos componentes (nomes das colunas, formatos, agrupamentos, filtros, totais);
   - qual é a stack (Vite, React, HTML/JS simples etc.).

Com isso, monte um **mapeamento coluna da planilha → campo do Firestore** e me mostre antes de alterar os componentes. Se alguma coluna não tiver correspondente no Firestore, ou se algum dado precisar ser calculado, liste isso para eu decidir.

## Coleções envolvidas

- `plano-governo`
- `plano-tres-lagoas-sustentavel` (confirme no `padrao-dados-firestore.md` se esta coleção também deve aparecer na página)

Observações sobre os campos das etapas (confirme no `padrao-dados-firestore.md`):
- Os nomes têm hífen (`descricao-etapa1`, `peso-etapa1`, `previsao-etapa1`, `status-etapa1`, ... até `etapa5`). Use sempre `meta["peso-etapa1"]`, nunca `meta.peso-etapa1`.
- `peso-etapaN` está gravado como **string** (`"10"`). Converta para número antes de qualquer soma ou cálculo.
- `previsao-etapaN` é gravado como `AAAA-MM-DD` (ou `""`). Exiba sempre como `dd/mm/aaaa`. Aceite também `dd/mm/aaaa` na leitura, caso exista, e trate vazio sem erro.
- `status-etapaN` pode ser `Planejada`, `Em Partes`, `Concluída`, `Não Contemplada` ou `""` (não definido).
- Documentos sem algum campo não podem quebrar a página: trate como vazio.

## Configuração do Firebase

Reaproveite a configuração do projeto existente. As variáveis do sistema interno são:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

- Para a página pública bastam `API_KEY`, `PROJECT_ID` e `APP_ID` (`AUTH_DOMAIN` é opcional). Não inclua Storage nem Messaging se não forem usados.
- Se a página usar Vite, crie um `.env` com essas variáveis e um `.env.example` sem os valores. Se for HTML/JS sem bundler, use um objeto `firebaseConfig` em um arquivo de configuração separado.
- Esses valores **não são segredos** (vão para o navegador de qualquer forma). Quem protege os dados são as Security Rules.
- **Nunca** use `firebase-admin`, `serviceAccountKey.json` ou qualquer credencial de conta de serviço neste projeto. Se encontrar algo assim, me avise.
- Vou registrar um app web separado ("Página pública") no mesmo projeto Firebase, que terá um `APP_ID` próprio. Deixe o código pronto para receber esse valor pela configuração.

## Como ler os dados (economia de cota)

O projeto está no **plano gratuito (Spark)**: 50 mil leituras de documento por dia, **divididas com o sistema interno**. Cada documento retornado conta como 1 leitura. Se a cota esgotar, o sistema interno também para de funcionar até a renovação diária. Por isso:

- Use o SDK modular do Firebase (`firebase/app` e `firebase/firestore`) e importe só o necessário.
- Leia com **`getDocs` uma única vez** por carregamento. **Não use `onSnapshot`** (listener em tempo real), porque ele gasta leituras a cada alteração para cada visitante conectado.
- Implemente **cache no navegador** (`localStorage`), com validade configurável (padrão de **6 horas**):
  - se houver cache válido, use-o e não consulte o Firestore;
  - se não houver, consulte, salve no cache com a data/hora e renderize;
  - envolva o acesso ao `localStorage` em `try/catch` (pode estar indisponível) e, nesse caso, siga sem cache;
  - se a consulta ao Firestore falhar e existir cache vencido, exiba o cache vencido com um aviso discreto de "dados podem estar desatualizados".
- Mostre na página a **data/hora da última atualização dos dados**. Se existir um campo de atualização nos documentos (veja o `padrao-dados-firestore.md`), use o mais recente; senão, use o horário da consulta.
- Mostre um estado de carregamento e uma mensagem de erro amigável se não for possível carregar.
- Não faça consultas por meta, uma a uma (ex.: abrir o detalhe de uma meta). Use os dados já carregados na lista.

## Security Rules

A leitura pública da coleção precisa ser liberada nas regras. A regra esperada é:

```
match /plano-governo/{doc} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

(o mesmo para `plano-tres-lagoas-sustentavel`, se ela for usada na página)

**Importante:**
- **Não publique nem sobrescreva as regras do Firestore.** As regras são do projeto inteiro e o sistema interno depende delas. Gere um arquivo `firestore.rules.sugestao` com o trecho a acrescentar e me explique como mesclar com as regras atuais. Eu mesmo vou aplicar pelo console.
- Me avise que, com a leitura pública, **qualquer campo criado no futuro nessas coleções também ficará público**.
- Se as regras atuais tiverem algo como `allow read, write: if true`, me alerte: isso permite que qualquer pessoa **altere** os dados.

## Transição do Google Sheets

- Mantenha o código de leitura do Google Sheets por enquanto, atrás de uma configuração simples (ex.: `FONTE_DADOS = "firestore" | "sheets"`), para eu poder voltar rapidamente se algo der errado. Depois que eu validar, removemos.
- A página deve continuar com o mesmo visual e o mesmo comportamento. Só a fonte dos dados muda. Se algum ajuste visual for inevitável, me diga qual e por quê.

## Opcional (deixe preparado, mas desativado)

- **App Check** com reCAPTCHA v3/Enterprise, para que o Firestore aceite só requisições vindas do site. Deixe a inicialização pronta e controlada por configuração (desligada por padrão), e me explique os passos no console para ativar.

## Possível evolução futura (não implementar agora)

Se o consumo de leituras ficar alto (metas × visitas/dia perto de 20–25 mil), a alternativa é o sistema interno gravar um **documento único de resumo** (ex.: `publico/plano-governo`) com todas as metas, e a página ler só esse documento (1 leitura por visita). Estruture o código de leitura em uma função/módulo isolado (ex.: `carregarMetas()`) para essa troca ser simples depois.

## Critérios de aceite

- [ ] Li o `padrao-dados-firestore.md` e o código atual, e apresentei o mapeamento planilha → Firestore antes de alterar os componentes.
- [ ] A página carrega os dados do Firestore com `getDocs`, sem `onSnapshot`.
- [ ] O cache em `localStorage` funciona, com validade configurável e fallback em caso de erro.
- [ ] Datas aparecem como `dd/mm/aaaa`, pesos são tratados como número, e valores vazios não quebram a página.
- [ ] A data da última atualização aparece na página.
- [ ] Nenhuma credencial de conta de serviço no projeto, e `.env` fora do controle de versão (`.gitignore`).
- [ ] Regras sugeridas entregues em arquivo separado, sem publicar nada.
- [ ] Opção para voltar ao Google Sheets mantida.
- [ ] Visual e comportamento da página iguais aos de antes.

Ao terminar, liste os arquivos criados/alterados com um resumo do que mudou em cada um, e uma estimativa de quantas leituras por visita a página consome (número de documentos lidos sem cache).