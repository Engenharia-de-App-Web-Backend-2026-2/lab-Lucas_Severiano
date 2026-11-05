# Lab 01: Balanceamento de Carga com Nginx
**Aluno:** Lucas Santos da Hora Severiano
**Matrícula:** 202311250075
## 1. Ajuste de Porta (8080)
*Descreva brevemente quais arquivos foram alterados para a porta 8080 e cole abaixo a saída do terminal comprovando o funcionamento na nova porta.*
    [Cole a saída do curl ou print do terminal aqui]
## 2. Teste dos Algoritmos de Balanceamento
### 2.1. Round Robin com Peso (Weighted)
*Qual configuração foi aplicada no `nginx.conf`?*
    [Cole o trecho do bloco upstream aqui]
*Evidência da distribuição desproporcional (saída do terminal):*
    [Cole a saída do terminal aqui]
### 2.2. IP Hash (Persistência de Sessão)
*Evidência de que o tráfego foi fixado em um único nó:*
    [Cole a saída do terminal demonstrando o mesmo hostname em requisições seguidas]
### 2.3. Least Connections
*Trecho de configuração aplicado:*
    [Cole o trecho do bloco upstream aqui]
## 3. Segurança e Rastreabilidade
### 3.1. Rate Limiting
*Evidência do bloqueio por excesso de requisições (comprovando o erro 503):*
    [Cole a saída do terminal mostrando as requisições bem-sucedidas e as rejeitadas]
### 3.2. Injeção de Headers de Proxy
*Evidência da aplicação back-end recebendo o IP real do cliente:*
    [Cole a saída do curl demonstrando os headers X-Real-IP e X-Forwarded-For no retorno]
## 4. Análise: Limitações da versão Open Source
**Pergunta:** Por que a versão Open Source do Nginx não possui suporte nativo aos algoritmos de *Least Response Time* e *Adaptive Routing*? Como essas limitações são tratadas no mercado?
**Resposta:** 
[Redija sua justificativa técnica e comercial aqui]