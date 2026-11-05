# Lab 01: Balanceamento de Carga com Nginx
**Aluno:** Lucas Santos da Hora Severiano
**Matrícula:** 202311250075
## 1. Ajuste de Porta (8080)
*Descreva brevemente quais arquivos foram alterados para a porta 8080 e cole abaixo a saída do terminal comprovando o funcionamento na nova porta.*

Foram alterados dois arquivos em `lab02/`:

- `docker-compose.yml`: o mapeamento de portas do `loadbalancer` passou de `"80:80"` para `"8080:8080"`.
- `nginx.conf`: a diretiva `listen` do bloco `server` passou de `80` para `8080`.

Após recriar os containers com `docker compose up -d --force-recreate`, o balanceador passou a responder na porta 8080:

    Saída do Curl:
        ~/lab-Lucas_Severiano/lab02$ curl -v http://localhost:8080
        * Host localhost:8080 was resolved.
        * IPv6: ::1
        * IPv4: 127.0.0.1
        *   Trying [::1]:8080...
        * Connected to localhost (::1) port 8080
        > GET / HTTP/1.1
        > Host: localhost:8080
        > User-Agent: curl/8.5.0
        > Accept: */*
        > 
        < HTTP/1.1 200 OK
        < Server: nginx/1.31.8
        < Date: Thu, 05 Nov 2026 21:00:19 GMT
        < Content-Type: text/plain; charset=utf-8
        < Content-Length: 238
        < Connection: keep-alive
        < 
        Hostname: ca7daf4c4698
        IP: 127.0.0.1
        IP: ::1
        IP: 172.18.0.4
        RemoteAddr: 172.18.0.5:55896
        GET / HTTP/1.1
        Host: localhost
        User-Agent: curl/8.5.0
        Accept: */*
        X-Forwarded-For: 172.18.0.1
        X-Forwarded-Proto: http
        X-Real-Ip: 172.18.0.1

        * Connection #0 to host localhost left intact

        Saída do load_teste.sh:
        ~/lab-Lucas_Severiano/lab02$ for i in {1..12}; do curl -s http://localhost:8080 | grep Hostname; done
        Hostname: f5ac5bb976ec
        Hostname: 5f33bf34738d
        Hostname: ca7daf4c4698
        Hostname: f5ac5bb976ec
        Hostname: 5f33bf34738d
        Hostname: ca7daf4c4698
        Hostname: f5ac5bb976ec
        Hostname: 5f33bf34738d
        Hostname: ca7daf4c4698
        Hostname: f5ac5bb976ec
        Hostname: 5f33bf34738d
        Hostname: ca7daf4c4698

## 2. Teste dos Algoritmos de Balanceamento
### 2.1. Round Robin com Peso (Weighted)
*Qual configuração foi aplicada no `nginx.conf`?*
    upstream meus_servidores {
        server backend1:80 weight=3;
        server backend2:80;
        server backend3:80;
    }
*Evidência da distribuição desproporcional (saída do terminal):*
    ~/lab-Lucas_Severiano/lab02$ for i in {1..15}; do curl -s http://localhost:8080 | grep Hostname; done | sort | uniq -c
      3 Hostname: 5f33bf34738d
      9 Hostname: ca7daf4c4698
      3 Hostname: f5ac5bb976ec
### 2.2. IP Hash (Persistência de Sessão)
*Evidência de que o tráfego foi fixado em um único nó:*
    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

    HTTP/1.1 200 OK
    Server: nginx/1.31.8
    Date: Thu, 05 Nov 2026 21:18:37 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 238
    Connection: keep-alive

    Hostname: ca7daf4c4698
    IP: 127.0.0.1
    IP: ::1
    IP: 172.18.0.4
    RemoteAddr: 172.18.0.5:59488
    GET / HTTP/1.1
    Host: localhost
    User-Agent: curl/8.5.0
    Accept: */*
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1
### 2.3. Least Connections
*Trecho de configuração aplicado:*
    upstream meus_servidores {
        least_conn;
        server backend1:80;
        server backend2:80;
        server backend3:80;
    }

    Saída do terminal:
    ~/lab-Lucas_Severiano/lab02$    for i in {1..12}; do curl -s http://localhost:8080 | grep Hostname; done | sort | uniq -c
      4 Hostname: 5f33bf34738d
      4 Hostname: ca7daf4c4698
      4 Hostname: f5ac5bb976ec

## 3. Segurança e Rastreabilidade
### 3.1. Rate Limiting
*Evidência do bloqueio por excesso de requisições (comprovando o erro 503):*
    ~/lab-Lucas_Severiano/lab02$ for i in {1..10}; do curl -s -o /dev/null -w "Requisição $i: HTTP %{http_code}\n" http://localhost:8080; done
    Requisição 1: HTTP 200
    Requisição 2: HTTP 503
    Requisição 3: HTTP 503
    Requisição 4: HTTP 503
    Requisição 5: HTTP 503
    Requisição 6: HTTP 503
    Requisição 7: HTTP 503
    Requisição 8: HTTP 503
    Requisição 9: HTTP 503
    Requisição 10: HTTP 503

### 3.2. Injeção de Headers de Proxy
*Evidência da aplicação back-end recebendo o IP real do cliente:*
    ~/lab-Lucas_Severiano/lab02$ sleep 1; curl -s http://localhost:8080 | grep -i -E "X-Real-Ip|X-Forwarded-For|X-Forwarded-Proto"
    X-Forwarded-For: 172.18.0.1
    X-Forwarded-Proto: http
    X-Real-Ip: 172.18.0.1

## 4. Análise: Limitações da versão Open Source
**Pergunta:** Por que a versão Open Source do Nginx não possui suporte nativo aos algoritmos de *Least Response Time* e *Adaptive Routing*? Como essas limitações são tratadas no mercado?
**Resposta:** 
A versão Open Source do Nginx oferece Round Robin, Least Connections, IP Hash, Hash genérico e Random, algoritmos que decidem com base em estado local simples (contadores de conexão, hash do IP). Já o Least Response Time (least_time) exige medir continuamente a latência de cada back-end (tempo até o primeiro byte ou até o último byte), manter essas métricas em memória compartilhada entre os workers e combiná-las com health checks ativos. Esse conjunto de monitoramento em tempo real é justamente o que o Nginx separa na versão comercial NGINX Plus, e o least_time é um recurso exclusivo dela, ao lado de health checks ativos, persistência de sessão por cookie, API de reconfiguração dinâmica e dashboard. Trata-se de uma decisão de produto e comercial (modelo open core), além de técnica. O roteamento adaptativo, que ajusta a escolha do servidor conforme o estado de saúde e carga observados, depende da mesma infraestrutura de telemetria e também fica fora do núcleo open source.

No mercado, o problema é tratado de várias formas: contratando o NGINX Plus; usando alternativas com esses recursos nativos, como HAProxy, Envoy e Traefik; usando balanceadores gerenciados de nuvem (AWS ALB, GCP, Azure); ou, no Nginx OSS, recorrendo a módulos de terceiros (como upstream_fair) ou scripts em Lua/OpenResty, com maior custo de manutenção.