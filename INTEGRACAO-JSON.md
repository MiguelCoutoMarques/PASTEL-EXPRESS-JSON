# Integração Pastel Express via JSON

O site está hospedado no GitHub Pages e, por segurança, não se conecta diretamente ao MySQL. A integração implementada para o Projeto Integrador é:

```text
Site HTML/CSS/JavaScript
        |
        | botão "Baixar pedidos.json"
        v
Arquivo pedidos.json
        |
        | botão "Importar pedidos JSON" no C#
        v
Banco MySQL DB_Delivery / tabela pedidos
```

## Login e histórico por conta

As contas da demonstração são armazenadas no `localStorage` do navegador. O cadastro salva nome, e-mail, senha e demais dados do perfil em `pastel-users`. A sessão ativa fica em `pastel-session`.

Cada conta possui uma chave própria de pedidos no formato `pastel-orders-email@dominio.com`. Assim, o cliente só visualiza, cancela e exporta os pedidos da própria conta. O checkout também exige uma sessão autenticada.

Esse login é adequado para demonstração local e para o fluxo exigido pelo trabalho. Não é autenticação de produção, pois os dados ficam no navegador e a senha não deve ser tratada como segura nesse modelo.

## Como usar

1. Acesse a página **Meus pedidos** do site.
2. Finalize pedidos normalmente pelo carrinho.
3. Clique em **Baixar pedidos.json**.
4. Abra o aplicativo Windows Forms.
5. Acesse **Pedidos**.
6. Clique em **Importar pedidos JSON**.
7. Selecione o arquivo baixado.

O JavaScript exporta este formato:

```json
[
  {
    "numero": "#PE12345",
    "data": "06/11/2026",
    "itens": "2x Pastel de queijo, 1x Suco de laranja",
    "total": 24.0,
    "status": "Em preparo"
  }
]
```

O C# converte a data brasileira `dd/MM/yyyy` para `yyyy-MM-dd` antes de inserir no MySQL. Se o mesmo número de pedido for importado novamente, o registro é atualizado em vez de duplicado.

## Arquivos modificados

- `app.js`: função `exportOrdersJson()` e evento do botão.
- `pedidos.html`: botão **Baixar pedidos.json**.

## Limitação importante

O GitHub Pages serve arquivos estáticos. Para uma conexão automática em tempo real entre o site e o MySQL seria necessário um backend ou API hospedada em um servidor. Para o escopo do PDF, a ponte por JSON é a alternativa correta e segura.
