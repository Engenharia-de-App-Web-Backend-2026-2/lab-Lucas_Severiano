# 🐳 Laboratório Prático: Docker (Portas, Env e Volumes)

**Disciplina:** Engenharia de Aplicações Web Backend  
**Aluno:** Lucas Santos da Hora Severiano
  

---

## 🎯 Passo 1: Mapeamento de Portas
**Objetivo:** Compreender a diferença entre a porta do host e a porta do container.

- **Comando executado para subir o container (`container-portas`):**
```bash
docker build -t api-node-classroom:1.1 .

docker run -d --name container-portas -p 9090:4000 api-node-classroom:1.1
```

> No formato `-p HOST:CONTAINER`, a porta **9090** é a da máquina hospedeira e a **4000** é a porta em que a API escuta dentro do container.

- **Evidência (Print ou Saída do Terminal) do acesso em `http://localhost:9090`:**
> familia@familia-Lenovo-B490:~/lab-Lucas_Severiano/lab02$ curl http://localhost:9090
>  {
>    "status": "ok",
>    "servico": "api-node-classroom",
>    "rotas": [
>      "/info",
>      "/aviso"
>    ]
>  }

>familia@familia-Lenovo-B490:~/lab-Lucas_Severiano/lab02$ sudo docker ps --filter name=container-portas
>CONTAINER ID   IMAGE                    COMMAND                  CREATED          >STATUS          PORTS                                         NAMES
>fad901404bcf   api-node-classroom:1.1   "docker-entrypoint.s…"   36 seconds ago   Up 36 >seconds   0.0.0.0:9090->4000/tcp, [::]:9090->4000/tcp   container-portas

---

## 🎯 Passo 2: Variáveis de Ambiente (Configuração Dinâmica)
**Objetivo:** Demonstração do padrão *The Twelve-Factor App* injetando comportamentos diferentes na mesma imagem.

- **Comandos executados para subir os containers (`container-prod` e `container-test`):**
```bash
docker run -d --name container-prod -p 8081:4000 \
  -e APP_MESSAGE="Ambiente de Produção" \
  api-node-classroom:1.1

docker run -d --name container-test -p 8082:4000 \
  -e APP_MESSAGE="Ambiente de Testes" \
  api-node-classroom:1.1
```

- **Evidência do acesso em `http://localhost:8081/info` (Produção):**
> familia@familia-Lenovo-B490:~/lab-Lucas_Severiano/lab02$ curl http://localhost:8081/info
>{
>  "mensagem": "Ambiente de Produção",
>  "hostname": "504f3db44a31",
>  "porta_interna": 4000,
>  "node": "v20.20.2"
>}

- **Evidência do acesso em `http://localhost:8082/info` (Testes):**
> familia@familia-Lenovo-B490:~/lab-Lucas_Severiano/lab02$ curl http://localhost:8082/info
>{
>  "mensagem": "Ambiente de Testes",
>  "hostname": "e586bea32aff",
>  "porta_interna": 4000,
>  "node": "v20.20.2"
>}

---

## 🎯 Passo 3: Volumes e Bind Mounts
**Objetivo:** Leitura de dados do sistema hospedeiro em tempo real sem reconstruir a imagem.

- **Comando executado para subir o container com o volume (`container-volume`):**
```bash
docker run -d --name container-volume -p 8083:4000 \
  -v "$(pwd)/aviso.txt:/usr/src/app/dados/aviso.txt" \
  api-node-classroom:1.1
```

- **Evidência 1: Acesso em `http://localhost:8083/aviso` (Texto Original):**
> familia@familia-Lenovo-B490:~/lab-Lucas_Severiano/lab02$ curl http://localhost:8083/aviso
>Aviso original: este texto vem do arquivo aviso.txt do host (bind mount).

- **Evidência 2: Acesso em `http://localhost:8083/aviso` (Após alterar o arquivo `aviso.txt` localmente):**
> familia@familia-Lenovo-B490:~/lab-Lucas_Severiano/lab02$ curl http://localhost:8083/aviso
>Aviso alterado no host em tempo real!

---

## 🛡️ Passo 4: Análise Teórica e Boas Práticas (.dockerignore)

**Justifique, sob uma visão arquitetural de CI/CD, por que é crítico ignorar arquivos locais (como `.env`, `aviso.txt` e pastas de `dados/`) na construção da imagem utilizando o `.dockerignore`:**

> Em um pipeline de CI/CD, a imagem é um **artefato imutável e promovível**: o mesmo artefato, construído uma única vez, deve rodar em teste, homologação e produção, mudando apenas a configuração injetada em tempo de execução (fator III do *Twelve-Factor App*). O `.dockerignore` protege essa premissa em dois pontos.
>
> **1. Vazamento de credenciais.** Um `COPY . .` copia tudo o que estiver no contexto de build, inclusive o `.env` com senhas, tokens e chaves de acesso. Como a imagem é composta por camadas imutáveis, o segredo passa a fazer parte do artefato: qualquer pessoa com acesso a `docker pull`, `docker save` ou `docker history` (registry, cache de CI, outros times) consegue extraí-lo, e apagá-lo em uma camada posterior **não** o remove das camadas anteriores. Além disso, a imagem ficaria "presa" a um ambiente específico, quebrando a promoção do mesmo artefato entre ambientes e forçando a rotação de chaves a cada vazamento. Segredos devem ser injetados em runtime (`-e`, `--env-file`, secrets do orquestrador ou do CI), nunca embutidos na imagem.
>
> **2. Bloat (inchaço) da imagem.** O `node_modules` local pode ter centenas de MB e conter binários compilados para o sistema do desenvolvedor (Windows/macOS), incompatíveis com o Linux Alpine do container; as dependências devem ser instaladas dentro da imagem (`npm ci`), de forma reproduzível. Já `aviso.txt` e `dados/` são dados do ambiente hospedeiro: devem entrar via **volume/bind mount**, e não copiados para a imagem, o que a deixaria desatualizada e acoplada a dados que mudam o tempo todo. Imagens maiores aumentam o tempo de build, de push/pull no registry e de deploy (escala e rollback mais lentos), consomem mais armazenamento e banda e ampliam a superfície de ataque. Ignorar esses arquivos também mantém o contexto de build pequeno e preserva o cache de camadas: alterar um arquivo local irrelevante não invalida o `COPY` nem força rebuilds desnecessários no pipeline.
