# AGENT.md — Projeto INT GRP02 Carrinho

## 1. Identidade do Agente

Você é um agente de desenvolvimento responsável por auxiliar na construção, manutenção, documentação, testes e evolução do projeto **Projeto INT GRP02 Carrinho**.

O projeto é um sistema web de gestão para um **quiosque de praia**, desenvolvido utilizando principalmente:

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Banco de dados relacional
- Maven ou Gradle
- REST API
- HTML/CSS/JavaScript ou framework frontend separado, quando aplicável

Seu objetivo é ajudar a desenvolver um sistema **funcional, organizado, seguro, modular e de fácil manutenção**.

---

# 2. Contexto do Projeto

O sistema tem como objetivo substituir processos manuais utilizados em quiosques de praia, principalmente:

- Comandas de papel;
- Registro manual de pedidos;
- Controle manual de estoque;
- Controle de vendas;
- Acompanhamento de pedidos;
- Organização das informações dos clientes.

O sistema deve centralizar essas informações e automatizar os principais processos do quiosque.

Os principais problemas que o sistema deve solucionar são:

- Erros no registro dos pedidos;
- Perda de informações;
- Demora no atendimento;
- Falhas no controle de estoque;
- Dificuldade no acompanhamento das vendas;
- Pedidos não registrados;
- Possíveis perdas financeiras.

---

# 3. Objetivo Principal

Priorize a implementação completa e estável do fluxo:

```text
Cardápio
    ↓
Carrinho
    ↓
Identificação da Comanda
    ↓
Pagamento
    ↓
Pedido
    ↓
Atualização do Estoque
    ↓
Registro da Venda
    ↓
Acompanhamento do Pedido
```

Depois que esse fluxo estiver funcional, implemente as funcionalidades administrativas e, posteriormente, funcionalidades extras.

Não implemente funcionalidades futuras apenas para aumentar a complexidade do projeto.

---

# 4. Requisitos Funcionais

O sistema deve atender aos seguintes requisitos:

| Código | Requisito |
|--------|-----------|
| RF01 | Login |
| RF02 | Controle de permissões |
| RF04 | Visualização do cardápio |
| RF06 | Adição de produtos ao carrinho |
| RF07 | Gerenciamento do carrinho |
| RF09 | Criação de comanda |
| RF10 | Realização de pagamento |
| RF12 | Criação do pedido |
| RF14 | Acompanhamento do pedido |
| RF16 | Consulta de comandas |
| RF19 | Cadastro de produtos |
| RF21 | Controle de estoque |
| RF24 | Baixa automática do estoque |
| RF26 | Alerta de estoque baixo |
| RF28 | Registro de vendas |
| RF30 | Dashboard |
| RF31 | Relatórios de vendas |

Todos os requisitos devem ser considerados durante o desenvolvimento.

Quando implementar uma funcionalidade relacionada a um requisito, indicar claramente qual requisito está sendo atendido.

---

# 5. Ambientes do Sistema

O sistema possui dois ambientes principais.

## 5.1 Área do Cliente

O cliente deve conseguir:

- Visualizar o cardápio;
- Visualizar produtos;
- Adicionar produtos ao carrinho;
- Alterar quantidades;
- Remover produtos;
- Informar seus dados;
- Informar a comanda;
- Visualizar o resumo da compra;
- Escolher a forma de pagamento;
- Finalizar o pedido;
- Receber confirmação;
- Acompanhar o status do pedido.

Fluxo:

```text
Cardápio
→ Produto
→ Carrinho
→ Identificação
→ Pagamento
→ Confirmação
→ Acompanhamento
```

---

## 5.2 Área Administrativa

A área administrativa deve ser protegida por autenticação.

Funcionários e administradores podem possuir diferentes permissões.

Funcionalidades:

- Dashboard;
- Pedidos;
- Comandas;
- Produtos;
- Estoque;
- Vendas;
- Funcionários;
- Relatórios.

A área administrativa não deve ficar exposta diretamente ao público.

---

# 6. Controle de Permissões

Existem pelo menos dois níveis de acesso.

## Administrador

Pode acessar:

- Dashboard;
- Pedidos;
- Comandas;
- Produtos;
- Estoque;
- Vendas;
- Funcionários;
- Relatórios.

## Funcionário

Pode acessar as funções necessárias para:

- Atendimento;
- Consulta de pedidos;
- Atualização de pedidos;
- Consulta de comandas;
- Operações permitidas de estoque.

Não deve possuir acesso a configurações administrativas sensíveis.

Utilizar **Spring Security** para autenticação e autorização.

As permissões devem ser aplicadas também no backend.

Nunca confiar somente na proteção da interface.

---

# 7. Arquitetura

Utilizar uma arquitetura organizada baseada em camadas.

Estrutura recomendada:

```text
src/
└── main/
    └── java/
        └── .../
            ├── controller/
            ├── service/
            ├── repository/
            ├── model/
            ├── dto/
            ├── mapper/
            ├── exception/
            ├── config/
            ├── security/
            └── util/
```

Responsabilidades:

### Controller

Responsável por:

- Receber requisições HTTP;
- Validar entrada básica;
- Chamar Services;
- Retornar respostas HTTP.

Não colocar regras de negócio complexas nos Controllers.

### Service

Responsável por:

- Regras de negócio;
- Validações;
- Processamento das operações;
- Orquestração entre entidades e repositories.

### Repository

Responsável pelo acesso ao banco de dados.

Utilizar Spring Data JPA quando adequado.

### Model / Entity

Representar as entidades persistidas no banco.

### DTO

Utilizar DTOs para entrada e saída da API quando necessário.

Evitar expor diretamente entidades JPA em APIs públicas quando isso puder causar problemas de segurança, acoplamento ou serialização.

### Security

Centralizar:

- Autenticação;
- Autorização;
- Roles;
- Configurações de segurança.

---

# 8. Entidades Principais

As principais entidades do sistema são:

```text
Usuario
Comanda
Carrinho
ItemCarrinho
Pedido
ItemPedido
Produto
Categoria
MovimentacaoEstoque
Venda
Pagamento
```

---

# 9. Model — Usuario

Campos:

```text
id
nome
email
senha
cargo
```

Responsabilidades:

```text
login()
logout()
cadastrarUsuario()
alterarUsuario()
removerUsuario()
```

A senha nunca deve ser armazenada em texto puro.

Utilizar mecanismo seguro de hashing, preferencialmente BCrypt através do Spring Security.

---

# 10. Model — Comanda

Campos:

```text
id
numero
nomeCliente
status
dataAbertura
dataFechamento
valorTotal
```

Responsabilidades:

```text
abrirComanda()
consultarComanda()
calcularTotal()
fecharComanda()
cancelarComanda()
```

Regras:

- Cada comanda deve possuir número único;
- O nome do cliente pertence à Comanda;
- Uma Comanda pode possuir vários Pedidos;
- Não utilizar mesas no sistema;
- Uma comanda fechada não deve receber novos pedidos sem uma regra explícita que permita isso.

---

# 11. Model — Carrinho

Campos:

```text
id
comanda
valorTotal
```

Responsabilidades:

```text
adicionarProduto()
removerProduto()
alterarQuantidade()
calcularTotal()
limparCarrinho()
```

---

# 12. Model — ItemCarrinho

Campos:

```text
id
carrinho
produto
quantidade
precoUnitario
```

Regras:

- Quantidade mínima: 1;
- O preço deve ser tratado corretamente;
- Utilizar BigDecimal para valores monetários;
- O total deve ser calculado automaticamente.

---

# 13. Model — Pedido

Campos:

```text
id
comanda
usuario
data
status
valorTotal
```

Responsabilidades:

```text
criarPedido()
adicionarItem()
removerItem()
alterarQuantidade()
alterarStatus()
cancelarPedido()
```

Status:

```text
PENDENTE
EM_PREPARO
PRONTO
ENTREGUE
CANCELADO
```

Regras:

- O pedido deve possuir identificador único;
- Deve estar associado a uma Comanda;
- Deve possuir um ou mais itens;
- O status deve possuir transições controladas;
- Pedido cancelado não deve ser tratado como venda concluída.

---

# 14. Model — ItemPedido

Campos:

```text
id
pedido
produto
quantidade
precoUnitario
```

O preço unitário deve representar o preço aplicado no momento da criação do pedido.

Não depender exclusivamente do preço atual do Produto para reconstruir pedidos antigos.

---

# 15. Model — Produto

Campos:

```text
id
nome
descricao
preco
quantidadeEstoque
estoqueMinimo
categoria
disponibilidade
```

Responsabilidades:

```text
cadastrarProduto()
alterarProduto()
removerProduto()
consultarProduto()
alterarPreco()
alterarDisponibilidade()
```

Regras:

- Não permitir preço negativo;
- Não permitir estoque negativo;
- Produto indisponível não deve aparecer como comprável;
- Produto sem estoque não deve poder ser comprado;
- Produtos abaixo do estoque mínimo devem gerar alerta administrativo.

---

# 16. Model — Categoria

Campos:

```text
id
nome
```

Uma categoria pode possuir vários produtos.

Exemplos:

```text
Bebidas
Porções
Lanches
Sobremesas
Outros
```

---

# 17. Model — MovimentacaoEstoque

Campos:

```text
id
produto
tipo
quantidade
data
usuario
```

Tipos:

```text
ENTRADA
SAIDA
```

Responsabilidades:

```text
adicionarEstoque()
removerEstoque()
consultarEstoque()
verificarEstoqueMinimo()
registrarMovimentacao()
```

Toda alteração relevante de estoque deve gerar uma movimentação.

---

# 18. Model — Venda

Campos:

```text
id
comanda
usuario
valorTotal
formaPagamento
data
```

Responsabilidades:

```text
registrarVenda()
calcularTotal()
registrarPagamento()
consultarVenda()
```

A Venda representa o registro financeiro de uma compra concluída.

---

# 19. Model — Pagamento

Campos:

```text
id
venda
formaPagamento
valor
status
data
```

Formas de pagamento:

```text
PIX
CARTAO
DINHEIRO
```

Status possíveis:

```text
PENDENTE
APROVADO
CANCELADO
```

Responsabilidades:

```text
processarPagamento()
registrarPagamento()
confirmarPagamento()
cancelarPagamento()
```

Nesta primeira versão, não é necessário integrar com um banco ou gateway de pagamento real.

A arquitetura deve, entretanto, permitir essa integração futuramente.

---

# 20. Regras de Estoque

O estoque é uma parte crítica do sistema.

Ao confirmar um pedido/pagamento, deve ocorrer a baixa dos produtos conforme a regra definida pelo fluxo da aplicação.

Antes da baixa:

1. Verificar se o produto existe;
2. Verificar se está disponível;
3. Verificar quantidade suficiente;
4. Executar a baixa;
5. Registrar a movimentação;
6. Verificar estoque mínimo;
7. Gerar alerta quando necessário.

Nunca permitir estoque negativo.

As operações críticas de estoque devem ser transacionais.

Utilizar `@Transactional` quando necessário para garantir consistência.

---

# 21. Fluxo de Compra

O fluxo principal deve seguir:

```text
CARDÁPIO
    ↓
SELECIONAR PRODUTOS
    ↓
CARRINHO
    ↓
IDENTIFICAÇÃO
    ↓
PAGAMENTO
    ↓
CONFIRMAÇÃO
    ↓
PEDIDO
    ↓
PREPARAÇÃO
    ↓
ENTREGA
```

Ao confirmar a compra:

```text
Carrinho
    ↓
Validar produtos
    ↓
Validar estoque
    ↓
Calcular total
    ↓
Registrar pagamento
    ↓
Criar pedido
    ↓
Baixar estoque
    ↓
Registrar movimentação
    ↓
Registrar venda
    ↓
Limpar/finalizar carrinho
    ↓
Retornar confirmação
```

Esse fluxo deve ser tratado com cuidado para evitar duplicidade de pedidos, vendas ou baixas no estoque.

---

# 22. Comandas

Regras:

- Número da comanda deve ser único;
- Nome do cliente pertence à Comanda;
- Uma comanda pode possuir vários pedidos;
- Deve ser possível consultar os pedidos associados;
- Deve ser possível calcular o total da comanda;
- Deve ser possível fechar a comanda;
- Deve ser possível cancelar a comanda conforme as regras do sistema.

Não implementar mesas.

---

# 23. Carrinho

O carrinho deve permitir:

- Adicionar produto;
- Remover produto;
- Alterar quantidade;
- Calcular subtotal;
- Calcular total;
- Limpar carrinho.

Nunca permitir:

```text
quantidade <= 0
```

Utilizar `BigDecimal` para valores monetários.

---

# 24. API REST

Criar endpoints REST organizados.

Exemplo de estrutura:

```text
/api/auth
/api/produtos
/api/categorias
/api/carrinhos
/api/comandas
/api/pedidos
/api/pagamentos
/api/vendas
/api/estoque
/api/usuarios
/api/relatorios
```

Os endpoints devem:

- Utilizar HTTP methods corretamente;
- Validar dados;
- Retornar status HTTP apropriados;
- Possuir tratamento de erros;
- Respeitar autenticação e autorização.

---

# 25. Validação

Utilizar Bean Validation quando apropriado.

Exemplos:

```text
@NotBlank
@NotNull
@Email
@Positive
@PositiveOrZero
@Size
```

Não confiar apenas na validação do frontend.

Toda informação importante deve ser validada também no backend.

---

# 26. Tratamento de Erros

Criar tratamento global de exceções.

Preferencialmente utilizar:

```text
@RestControllerAdvice
```

Criar respostas de erro consistentes.

Exemplo:

```json
{
  "status": 400,
  "message": "Produto sem estoque disponível",
  "timestamp": "..."
}
```

Evitar retornar stack traces ou informações internas ao cliente.

---

# 27. Dashboard

O Dashboard administrativo deve apresentar:

- Vendas do dia;
- Faturamento;
- Quantidade de pedidos;
- Comandas abertas;
- Pedidos em andamento;
- Produtos com estoque baixo.

Também pode possuir gráficos de:

- Vendas por período;
- Produtos mais vendidos;
- Formas de pagamento.

---

# 28. Relatórios

Criar estrutura para:

```text
gerarRelatorioVendas()
gerarRelatorioEstoque()
gerarProdutosMaisVendidos()
calcularFaturamento()
```

Permitir filtros por período quando aplicável.

Relatórios devem utilizar dados reais do banco.

Não criar valores fictícios apenas para preencher a interface.

---

# 29. Segurança

Utilizar Spring Security.

Requisitos:

- Autenticação;
- Autorização;
- Controle por roles;
- Senhas criptografadas;
- Proteção das rotas administrativas;
- Validação no backend.

Nunca:

- Armazenar senha em texto puro;
- Expor senha em respostas da API;
- Confiar apenas na proteção do frontend;
- Permitir acesso administrativo sem autenticação.

---

# 30. Banco de Dados

Utilizar JPA/Hibernate para persistência.

Definir corretamente:

- `@Entity`;
- `@Id`;
- `@GeneratedValue`;
- `@OneToMany`;
- `@ManyToOne`;
- `@OneToOne`;
- `@ManyToMany`, somente quando realmente necessário.

Evitar relacionamentos desnecessariamente complexos.

Criar constraints importantes no banco quando possível, principalmente para campos que precisam ser únicos.

---

# 31. Regras de Desenvolvimento

Ao desenvolver uma funcionalidade:

1. Entender o requisito;
2. Identificar as entidades envolvidas;
3. Identificar as regras de negócio;
4. Criar/alterar Model;
5. Criar/alterar Repository;
6. Criar/alterar Service;
7. Criar/alterar DTOs quando necessário;
8. Criar/alterar Controller;
9. Implementar validações;
10. Implementar tratamento de erros;
11. Implementar segurança;
12. Criar testes;
13. Verificar integração com as demais partes;
14. Somente então considerar a funcionalidade concluída.

---

# 32. Regras para o Agente

Sempre que receber uma solicitação:

### 1. Analise o código existente

Antes de criar novos arquivos ou alterar estruturas importantes, procure entender:

- Estrutura do projeto;
- Classes existentes;
- Entidades;
- Services;
- Controllers;
- Repositories;
- Configurações;
- Banco de dados;
- Dependências.

Não recriar estruturas que já existem sem necessidade.

### 2. Evite alterações desnecessárias

Não modificar arquivos que não tenham relação com a tarefa.

Não refatorar todo o projeto apenas porque uma pequena alteração foi solicitada.

### 3. Preserve compatibilidade

Antes de alterar uma classe utilizada por outras partes do sistema, verifique seus usos.

Evite quebrar funcionalidades existentes.

### 4. Não invente funcionalidades

Implemente somente o que estiver:

- Nos requisitos;
- Nas regras do projeto;
- Explicitamente solicitado.

Se uma alteração exigir uma decisão arquitetural importante, explique a decisão antes de aplicá-la.

### 5. Priorize simplicidade

O projeto é acadêmico e precisa ser funcional e compreensível.

Não adicionar tecnologias, bibliotecas ou padrões desnecessários.

Evitar overengineering.

---

# 33. Prioridade de Implementação

A implementação deve seguir esta ordem:

## Fase 1 — Estrutura

- Configuração Spring Boot;
- Banco de dados;
- JPA;
- Estrutura de pacotes;
- Entidades principais.

## Fase 2 — Produtos

- Categoria;
- Produto;
- Cadastro;
- Consulta;
- Alteração;
- Disponibilidade.

## Fase 3 — Carrinho

- Carrinho;
- ItemCarrinho;
- Adicionar produto;
- Remover produto;
- Alterar quantidade;
- Cálculo do total.

## Fase 4 — Comanda

- Criação;
- Consulta;
- Associação com cliente;
- Associação com pedidos;
- Fechamento.

## Fase 5 — Pedido

- Criação;
- Itens;
- Status;
- Consulta;
- Atualização.

## Fase 6 — Pagamento

- Registro;
- Formas de pagamento;
- Confirmação;
- Cancelamento.

## Fase 7 — Estoque

- Consulta;
- Entrada;
- Saída;
- Baixa automática;
- Histórico;
- Alerta de estoque baixo.

## Fase 8 — Vendas

- Registro;
- Consulta;
- Filtros;
- Formas de pagamento.

## Fase 9 — Segurança

- Login;
- Spring Security;
- Roles;
- Permissões.

## Fase 10 — Administração

- Dashboard;
- Funcionários;
- Relatórios.

## Fase 11 — Testes e estabilidade

- Testes unitários;
- Testes de integração;
- Validação dos fluxos;
- Correção de erros;
- Revisão da arquitetura.

---

# 34. Testes

Sempre que implementar uma regra de negócio importante, considerar testes.

Priorizar testes para:

- Criação de pedidos;
- Cálculo do carrinho;
- Cálculo da comanda;
- Baixa de estoque;
- Estoque insuficiente;
- Pagamento;
- Registro de vendas;
- Permissões;
- Cancelamento de pedidos.

Exemplo:

```text
Dado que o produto possui 5 unidades
E o cliente compra 3
Então o estoque deve ficar com 2 unidades.
```

Outro exemplo:

```text
Dado que o produto possui 2 unidades
E o cliente tenta comprar 3
Então a operação deve ser recusada.
```

---

# 35. Valores Monetários

Nunca utilizar `double` ou `float` para representar dinheiro.

Utilizar:

```java
BigDecimal
```

Exemplo:

```java
private BigDecimal valorTotal;
```

---

# 36. Datas

Utilizar as classes modernas do Java:

```java
LocalDate
LocalDateTime
LocalTime
```

Evitar APIs antigas de data quando não forem necessárias.

---

# 37. Banco e Transações

Operações que envolvam múltiplas alterações relacionadas devem ser transacionais.

Exemplo:

```text
Criar pedido
+
Registrar pagamento
+
Baixar estoque
+
Registrar movimentação
+
Registrar venda
```

Se uma etapa crítica falhar, evitar deixar o sistema em estado inconsistente.

Utilizar:

```java
@Transactional
```

quando apropriado.

---

# 38. Idempotência e Duplicidade

Ter cuidado com operações que podem ser enviadas duas vezes.

Por exemplo:

```text
Cliente confirma pagamento
↓
requisição enviada novamente
```

O sistema não deve criar duas vendas ou dois pedidos acidentalmente.

Antes de implementar fluxos de pagamento/pedido, considerar mecanismos para evitar duplicidade.

---

# 39. Código

O código deve:

- Ser legível;
- Possuir nomes claros;
- Seguir convenções Java;
- Utilizar responsabilidades bem separadas;
- Evitar métodos excessivamente grandes;
- Evitar duplicação;
- Evitar regras de negócio em Controllers;
- Evitar lógica complexa nas Entities quando isso prejudicar a arquitetura.

Não gerar código desnecessariamente complexo.

---

# 40. Documentação

Quando solicitado, documentar:

- Endpoint;
- Objetivo;
- Parâmetros;
- Request;
- Response;
- Regras;
- Possíveis erros.

Quando houver mudança arquitetural importante, explicar:

```text
O que foi alterado
Por que foi alterado
Quais arquivos foram afetados
Quais impactos existem
```

---

# 41. Comportamento Esperado do Agente

Quando o usuário pedir uma implementação, não apenas fornecer código isolado.

Primeiro analisar a arquitetura atual.

Depois apresentar de forma objetiva:

```text
1. O que será alterado
2. Por que será alterado
3. Arquivos envolvidos
4. Implementação
5. Testes necessários
6. Possíveis impactos
```

Se a tarefa for pequena, reduzir a explicação e ir diretamente à implementação.

Se houver dúvida que impeça uma implementação correta, fazer uma pergunta objetiva.

Não fazer perguntas desnecessárias quando for possível tomar uma decisão razoável seguindo este documento.

---

# 42. Critérios de Conclusão

Uma funcionalidade somente deve ser considerada concluída quando:

- Está implementada;
- Compila;
- Não possui erros evidentes;
- Está integrada às demais partes;
- Possui validações necessárias;
- Respeita as permissões;
- Não quebra funcionalidades existentes;
- Possui tratamento de erros adequado;
- Foi testada quando aplicável.

---

# 43. Funcionalidades Futuras

A arquitetura pode ser preparada para:

- Aplicativo mobile;
- IA para previsão de estoque;
- Integração com WhatsApp;
- Integração com iFood;
- PIX automatizado;
- Integração com maquininhas;
- Sistema de fidelidade;
- Funcionamento offline;
- Sincronização posterior.

Essas funcionalidades NÃO devem ser implementadas na primeira versão, exceto quando solicitadas explicitamente.

---

# 44. Funcionalidades Extras Opcionais

Podem ser implementadas posteriormente:

- Tela de pedidos para cozinha;
- QR Code para comanda;
- Histórico de pedidos;
- Divisão de conta;
- Impressão de pedidos;
- Filtros avançados;
- Diferentes níveis de acesso.

Essas funcionalidades possuem prioridade menor que os requisitos funcionais principais.

---

# 45. Regra Final

O objetivo não é criar o sistema mais complexo possível.

O objetivo é criar um sistema:

```text
FUNCIONAL
+
ORGANIZADO
+
SEGURO
+
MODULAR
+
FÁCIL DE ENTENDER
+
FÁCIL DE MANTER
```

Priorize sempre:

1. Requisitos funcionais;
2. Regras de negócio;
3. Integridade dos dados;
4. Segurança;
5. Testabilidade;
6. Organização do código;
7. Simplicidade.

Antes de adicionar qualquer tecnologia ou funcionalidade, pergunte:

> "Isso é necessário para o funcionamento do Projeto INT GRP02 Carrinho?"

Se a resposta for não, não adicionar sem uma justificativa clara.