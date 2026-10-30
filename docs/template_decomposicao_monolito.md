# Laboratório 01: Decomposição de Monolitos e Cloud-Native

**Disciplina:** Engenharia de Backend
**Professor:** Ronaldo Amaral
**Aluno:** Lucas Santos da Hora Severiano
**Matrícula:** 202311250075

> **Diretriz de Execução:** Este laboratório deve ser desenvolvido e submetido **individualmente**. Realize seus commits com as respostas diretamente neste arquivo no repositório da disciplina.

---

## Cenário Base: MonolitoShop
O e-commerce **MonolitoShop** roda em um único servidor e compartilha um banco de dados relacional gigante. Com a proximidade de picos de acesso, a equipe de engenharia identificou falhas graves de lentidão e travamentos. Você foi escalado para planejar a modernização arquitetural deste sistema legado.

### Parte 1: Bounded Contexts e Microsserviços (Eixo Y - Decomposição)
Atualmente, a classe `Usuario` no código fonte do monolito possui 45 atributos, misturando dados de login, endereço de entrega, número do cartão de crédito e histórico de navegação no catálogo. O objetivo do Eixo Y é extrair fronteiras de negócio (*Bounded Contexts*) para projetar nossos futuros microsserviços.

**Tarefa 1.1 - Mapeamento:** Separe o sistema em 3 Bounded Contexts principais (ex: Identidade, Pagamentos, Logística) que atuarão como microsserviços independentes. Distribua quais informações da classe "Usuário" legado devem pertencer a cada novo microsserviço.

> **Sua Resposta 1.1:**
> - **Microsserviço 1 (Identidade):** identificador do usuário, nome, e-mail, senha armazenada somente como hash, telefone e dados de autenticação/autorização. Este contexto é responsável pela criação da conta, login, gerenciamento do perfil básico e permissões. Não deve armazenar dados de cartão nem histórico de navegação.
> - **Microsserviço 2 (Pagamentos):** identificador do cliente como referência externa, tokens ou identificadores de métodos de pagamento fornecidos por um provedor especializado, dados de cobrança e histórico de transações. O número completo do cartão não deve ser armazenado diretamente no serviço; o ideal é delegar sua captura e custódia a um provedor compatível com os requisitos de segurança, mantendo apenas um token/referência. Esse serviço é responsável por autorizar, registrar e consultar pagamentos.
> - **Microsserviço 3 (Logística):** identificador do cliente como referência externa, endereços de entrega, destinatário, telefone de contato para entrega e instruções logísticas. Este contexto mantém os endereços e acompanha a expedição e a entrega dos pedidos. O histórico de navegação do catálogo não pertence a esse contexto.

**Justificativa Técnica:** a divisão segue o Eixo Y do Cubo AKF, separando o sistema por capacidades de negócio e não apenas por classes ou tabelas. Cada contexto possui vocabulário, regras e responsabilidades coesas. A separação evita que uma alteração em autenticação afete pagamentos ou entregas e permite evoluir e escalar cada serviço de forma independente. O identificador do cliente pode ser usado como referência entre contextos, sem compartilhar tabelas ou banco de dados. O histórico de navegação, citado no cenário, é uma responsabilidade do domínio de Catálogo/Experiência de Navegação e não se encaixa naturalmente nos três contextos escolhidos; em uma decomposição mais completa, deveria ser extraído para um quarto contexto, em vez de ser colocado artificialmente em Identidade, Pagamentos ou Logística.

**Tarefa 1.2 - Diagrama de Arquitetura:** Crie um diagrama demonstrando a quebra do monolito nesses 3 novos microsserviços. O diagrama deve ilustrar as fronteiras dos contextos e seus respectivos bancos de dados isolados.

> **Sua Resposta 1.2 (Insira seu diagrama abaixo):**
> 
> 
> ```mermaid
>flowchart TD
>    C[Cliente / Aplicativo Web] --> GW[API Gateway]
>
>    subgraph LEGADO["Estado inicial — MonolitoShop"]
>        MONO[Aplicação monolítica]
>        DBMONO[(Banco relacional compartilhado)]
>        MONO --> DBMONO
>    end
>
>    GW -. "migração gradual: rotas transferidas" .-> ID
>    GW -. "migração gradual: rotas transferidas" .-> PAY
>    GW -. "migração gradual: rotas transferidas" .-> LOG
>
>    subgraph CONTEXTOS["Arquitetura alvo — Bounded Contexts independentes"]
>        subgraph BC1["Bounded Context: Identidade e Clientes"]
>            ID[Microsserviço de Identidade]
>            DB1[(Banco de Identidade)]
>            ID --> DB1
>        end
>
>        subgraph BC2["Bounded Context: Pagamentos"]
>            PAY[Microsserviço de Pagamentos]
>            DB2[(Banco de Pagamentos)]
>            PAY --> DB2
>        end
>
>        subgraph BC3["Bounded Context: Logística e Entregas"]
>            LOG[Microsserviço de Logística]
>            DB3[(Banco de Logística)]
>            LOG --> DB3
>        end
>    end
>
>    ID -. "ID do cliente / referência" .-> PAY
>    ID -. "ID do cliente / referência" .-> LOG
> ```

**Justificativa Técnica:** o monólito e seu banco compartilhado representam a situação inicial. Na arquitetura alvo, o API Gateway encaminha as requisições aos três serviços, cada um dentro de sua fronteira de domínio e com banco de dados próprio. As linhas tracejadas representam a transição gradual e as referências entre serviços, não o compartilhamento de tabelas. Em produção, a comunicação entre serviços deve considerar falhas de rede, latência, autenticação e consistência dos dados. O banco legado pode permanecer temporariamente durante a migração, mas deve deixar de ser a fonte compartilhada de escrita à medida que cada contexto assumir seus dados.

### Parte 2: O Cubo AKF e a Escalabilidade (Eixo X - Clonagem)
Durante os testes de carga, o servidor web atingiu 100% de CPU. A equipe decidiu colocar um *Load Balancer* e subir 3 instâncias idênticas do servidor. No entanto, ao fazer isso, os clientes começaram a reclamar que os itens desapareciam misteriosamente do carrinho de compras a cada clique.

**Tarefa:** Explique por que os itens somem do carrinho ao clonar o servidor (estado) e qual é a solução Cloud-Native (Stateless) para resolver este problema.

> **Sua Resposta:**
> O problema ocorre porque o carrinho está sendo mantido na memória local de cada instância. Com três servidores atrás do *Load Balancer*, uma requisição pode chegar à instância 1, que possui os itens adicionados, enquanto a requisição seguinte pode ser encaminhada à instância 2 ou 3. Como essas instâncias têm memórias independentes, elas não conhecem o estado armazenado pelas demais. Para o usuário, isso parece que os itens desapareceram.
>
> A solução é tornar as instâncias da aplicação **stateless**: o processo web não deve depender de dados de sessão ou carrinho armazenados exclusivamente em sua memória local. O estado necessário deve ser externalizado para um serviço compartilhado e persistente, acessível por todas as instâncias. Por exemplo, o carrinho pode ser armazenado em um banco de dados ou em um serviço de cache compartilhado, como Redis, usando o identificador da sessão ou do usuário como chave.
>
> Assim, qualquer instância recebe a requisição, identifica o usuário/sessão e consulta o mesmo armazenamento externo. O *Load Balancer* pode distribuir as requisições entre as três instâncias sem causar perda do carrinho, e novas instâncias podem ser adicionadas ou removidas sem transferir estado local. Dados que precisam sobreviver a reinicializações devem permanecer em armazenamento persistente; um cache deve ser dimensionado e configurado conforme a necessidade de durabilidade.
>
> **Justificativa técnica:** a proposta aplica o fator VI (*Processes / Statelessness*) do Twelve-Factor App e viabiliza o Eixo X do Cubo AKF, que consiste em executar cópias idênticas da aplicação. Também se alinha ao princípio Cloud-Native de efemeridade: uma instância pode falhar ou ser substituída sem perda dos dados do usuário. A afinidade de sessão (*sticky sessions*) poderia reduzir a ocorrência do problema, mas não resolve a dependência de estado local e dificulta a distribuição e a recuperação; por isso, não é a solução arquitetural preferencial.

### Parte 3: Particionamento de Dados (Eixo Z)
O serviço de Pedidos foi extraído com sucesso do monolito, mas seu banco de dados começou a apresentar lentidão devido ao volume massivo de transações originadas de todo o Brasil.

**Tarefa:** Proponha uma estratégia de *Sharding* (particionamento) para o banco de dados de Pedidos. Qual seria a sua chave de partição (Shard Key) e por quê?

> **Sua Resposta:**
> Proponho particionar os dados de Pedidos geograficamente, utilizando a **região de atendimento/entrega do pedido** como *Shard Key* (por exemplo: Norte, Nordeste, Centro-Oeste, Sudeste e Sul). Cada shard armazenaria os pedidos associados à sua região, distribuindo o volume de gravações, consultas e processamento entre diferentes nós.
>
> A região deve ser definida a partir de um atributo estável do pedido, como a região logística correspondente ao endereço de entrega no momento da criação. É importante registrar essa informação no próprio pedido, para que uma alteração posterior no endereço do cliente não mova silenciosamente pedidos antigos entre shards. A aplicação de Pedidos ou uma camada de roteamento consulta a chave e direciona cada operação ao shard correto.
>
> **Justificativa técnica:** o cenário informa que as transações vêm de todo o Brasil; portanto, a distribuição geográfica é uma dimensão de particionamento coerente com a origem da carga e pode reduzir a contenção em um único banco. A estratégia aplica o Eixo Z do Cubo AKF, no qual cada instância trata um subconjunto dos dados. Também pode aproximar os dados dos sistemas e operações regionais, dependendo da infraestrutura adotada.
>
> **Cuidados e limitações:** a distribuição real pode ser desigual --- por exemplo, o Sudeste pode concentrar muito mais pedidos que outras regiões ---, criando shards desbalanceados. Deve-se monitorar o volume por shard e prever redistribuição ou subdivisão quando necessário. Consultas nacionais, relatórios consolidados e pedidos que envolvam múltiplas regiões podem exigir agregação entre shards, aumentando a latência e a complexidade. Se a distribuição geográfica não corresponder ao padrão real de acesso, uma chave baseada em hash do identificador do pedido ou do cliente pode distribuir melhor a carga, mas tende a dificultar consultas por região. A escolha final deve ser validada com métricas de volume, frequência de consultas e regras de negócio.