# Ivan-Vanko Dashboarding Tool

![Explanatory Image](ivan-vanko.png)

"your software is a shit!"


![page graphic exemple](page-graphic.png)





## Sobre o Sistema

O Ivan-Vanko é uma plataforma projetada para a criação e visualização de dashboards interativos a partir de fontes de dados. O objetivo é que o usuário possa configurar uma URL de uma API e o sistema automaticamente monte e exiba os gráficos correspondentes aos dados consumidos.

**Estado Atual:** No momento, o sistema utiliza um serviço de simulação (`services/chart.service.js`) para gerar dados de exemplo dinamicamente. Isso permite o desenvolvimento e teste da interface de visualização sem a necessidade de um backend de dados real. A interação com os filtros na UI dispara a geração de novos dados aleatórios, simulando uma consulta a uma API.

A arquitetura é baseada em serviços, permitindo a fácil integração de novas fontes de dados e tipos de gráficos.

## Projetos Complementares

O **Ivan-Vanko** trabalha em conjunto com o [Justin-Hammer](https://github.com/mateusmed/justin-hammer). Enquanto o Ivan-Vanko é responsável por levantar e exibir os gráficos, o Justin-Hammer atua na simulação de dados ou na conexão com hosts para obtenção dessas informações, servindo como uma fonte de dados robusta para os dashboards.

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   node server.js
   ```
3. Abra seu navegador em `http://localhost:3000`.
