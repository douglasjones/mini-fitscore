This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

# Desafio Técnico: Mini FitScore™

Esta é uma implementação do desafio Mini FitScore™, construída com Next.js, TypeScript, Tailwind CSS e Firebase.

## Funcionalidades

- **Formulário de Avaliação:** Uma página para avaliar candidatos com base em 10 perguntas, divididas em Performance, Energia e Cultura.
- **Dashboard de Resultados:** Uma página que lista todos os candidatos avaliados, com seus respectivos FitScores e classificações.
- **Filtros:** O dashboard permite filtrar candidatos por classificação.
- **Persistência de Dados:** As avaliações são salvas no Firestore.
- **Processamento Assíncrono (Simulado):** Lógicas de negócio para notificação e geração de relatórios são simuladas no front-end.

## Estrutura do Projeto

- `src/app/page.tsx`: Contém o formulário de avaliação de candidatos.
- `src/app/dashboard/page.tsx`: Contém o dashboard para visualização dos resultados.
- `src/components/`: Contém componentes React reutilizáveis, como o `Modal`.
- `src/lib/firebase.ts`: Centraliza a inicialização e configuração do Firebase.

## Fórmula do FitScore

O FitScore é calculado como a soma direta das pontuações (de 0 a 10) de cada uma das 10 perguntas. A pontuação máxima é 100.

- **Fit Altíssimo:** ≥ 80
- **Fit Aprovado:** 60-79
- **Fit Questionável:** 40-59
- **Fora do Perfil:** < 40

## Setup do Projeto

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Para conectar a aplicação ao Firebase, você precisa configurar suas credenciais. Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Abra o arquivo `.env.local` e preencha as variáveis com os dados do seu projeto no Firebase:

- `NEXT_PUBLIC_APP_ID`: Um identificador para sua aplicação (usado no caminho do Firestore para organizar os dados).
- `NEXT_PUBLIC_FIREBASE_CONFIG`: O objeto de configuração do seu aplicativo web do Firebase. O valor deve ser uma string JSON.

### 3. Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Solução Assíncrona

O processamento assíncrono foi **simulado** no front-end para demonstrar a arquitetura e o fluxo de dados, conforme permitido pelo desafio.

### Lógica 1 — Notificação de Resultado

- **Trigger:** Evento de sucesso após o envio do formulário (`handleSubmit` em `src/app/page.tsx`).
- **Ação (Simulada):** A função `simulateNotification` é chamada, que aguarda 1 segundo (simulando uma chamada de API) e então exibe um modal de sucesso. Em um ambiente de produção, essa função seria substituída por uma chamada a um webhook (por exemplo, do n8n) ou a uma serverless function que enviaria um e-mail ou outra notificação ao candidato.

### Lógica 2 — Relatório de Aprovados

- **Trigger:** Clique no botão "Gerar Relatório de Aprovados" no dashboard (`/dashboard`).
- **Ação (Simulada):** A função `simulateReport` é chamada, aguardando 1.5 segundos e exibindo um modal de confirmação. Em produção, este botão poderia acionar um webhook que inicia um workflow para consultar o banco de dados por candidatos com `FitScore >= 80` e enviar um relatório por e-mail ao gestor. Alternativamente, um serviço de Cron (como Vercel Cron Jobs ou uma trigger no n8n) executaria essa lógica de forma agendada (ex: a cada 12h).



