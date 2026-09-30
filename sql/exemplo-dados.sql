-- =============================================================
-- Dados de exemplo para ver as telas preenchidas.
-- Rode DEPOIS de sql/clientes-vendas.sql. Pode deletar depois.
-- =============================================================

insert into public.clientes
  (nome, cpf, rg, email, telefone, data_nascimento, nacionalidade,
   estado_civil, profissao, endereco, numero, bairro, cidade, uf, cep, observacoes)
values
  ('Maria Silva',  '52998224725', '12.345.678-9', 'maria.silva@email.com', '11987654321',
   '1988-04-12', 'Brasileira', 'Casado(a)', 'Designer',
   'Rua das Palmeiras', '120', 'Jardim América', 'São Paulo', 'SP', '01434000',
   'Prefere janela no andar alto.'),
  ('João Pereira', '11144477735', '22.111.222-3', 'joao.pereira@email.com', '21998877665',
   '1975-11-30', 'Brasileira', 'Solteiro(a)', 'Engenheiro',
   'Avenida Atlântica', '1500', 'Copacabana', 'Rio de Janeiro', 'RJ', '22041001', null),
  ('Ana Beatriz Souza', '39053344705', '33.222.111-4', 'ana.souza@email.com', '3133334444',
   '1996-07-05', 'Brasileira', 'União estável', 'Enfermeira',
   'Alameda Santos', '900', 'Paraíso', 'Belo Horizonte', 'MG',    '30160912', null)
on conflict do nothing;

insert into public.vendas
  (numero, cliente_id, status, pacote_nome, destino, data_venda, data_viagem,
   data_retorno, quantidade_pax, itens, comissoes, valor_pago, forma_pagamento, observacoes)
select
  'VEN-2026-1001',
  c.id,
  'paga',
  'Pacote Roma + Paris',
  'Itália / França',
  '2026-09-20',
  '2026-11-10',
  '2026-11-20',
  2,
  '[{"id":"item-1","tipo":"padrao","tipoProduto":"aereo_hotel","descricao":"Pacote Roma + Paris 10 dias com hospedagem e traslados","tarifa":9800.00,"taxas":412.50,"desconto":300.00,"abatimento":0,"percentual":0}]'::jsonb,
  '[{"id":"com-1","pessoa":"Carlos Mendes","papel":"vendedor","percentual":6},{"id":"com-2","pessoa":"Agência Tehiva","papel":"agencia","percentual":2}]'::jsonb,
  9912.50,
  'Cartão de crédito',
  'Reserva confirmada na operadora.'
from public.clientes c
where c.cpf = '52998224725';

insert into public.vendas
  (numero, cliente_id, status, pacote_nome, destino, data_venda, data_viagem,
   data_retorno, quantidade_pax, itens, comissoes, valor_pago, forma_pagamento, observacoes)
select
  'VEN-2026-1002',
  c.id,
  'parcial',
  'Cruzeiro MSC Fantasia — 7 noites',
  'Bahia / Salvador',
  '2026-09-24',
  '2026-12-05',
  '2026-12-12',
  4,
  '[{"id":"item-1","tipo":"padrao","tipoProduto":"navio","descricao":"Cruzeiro 7 noites com camarotes internos e taxa de serviço","tarifa":2400.00,"taxas":285.00,"desconto":120.00,"abatimento":0,"percentual":0},{"id":"item-2","tipo":"padrao","tipoProduto":"seguro_viagem","descricao":"Seguro viagem com cobertura médica internacional","tarifa":0,"taxas":0,"desconto":0,"abatimento":0,"percentual":0}]'::jsonb,
  '[{"id":"com-1","pessoa":"Carlos Mendes","papel":"vendedor","percentual":8},{"id":"com-2","pessoa":"Ana Souza","papel":"indicacao","percentual":2}]'::jsonb,
  5000.00,
  'Parcelado',
  'Entrada paga, restante em 3 parcelas.'
from public.clientes c
where c.cpf = '11144477735';

-- Contas bancárias de exemplo
insert into public.contas (nome, banco, agencia, numero, tipo, titular, observacoes)
values
  ('Itaú — Conta Corrente',       'Itaú',      '0412', '12345-6', 'corrente', 'Tehiva Turismo ME', 'Conta principal de operação.'),
  ('Nubank — Conta Digital',     'Nu Pagamentos', null, '8891234-5', 'corrente', 'Tehiva Turismo ME', null),
  ('Bradesco — Poupança Reserva', 'Bradesco',  '2200', '99887-2',  'poupanca', 'Tehiva Turismo ME', 'Guarda de cauções e parcelas futuros.')
on conflict do nothing;

-- Entradas: refletem os valores_pago das vendas acima
insert into public.entradas (venda_id, valor, data, conta_id, forma_pagamento, observacoes)
select v.id, 4000.00, '2026-09-20', ct.id, 'Cartão de crédito', 'Parcela única — pago integral.'
from public.vendas v
join public.contas ct on ct.nome = 'Itaú — Conta Corrente'
where v.numero = 'VEN-2026-1001'
  and not exists (select 1 from public.entradas e where e.venda_id = v.id);

insert into public.entradas (venda_id, valor, data, conta_id, forma_pagamento, observacoes)
select v.id, 5000.00, '2026-09-24', ct.id, 'Pix', 'Entrada 1/4.'
from public.vendas v
join public.contas ct on ct.nome = 'Nubank — Conta Digital'
where v.numero = 'VEN-2026-1002'
  and not exists (select 1 from public.entradas e where e.venda_id = v.id);

insert into public.entradas (venda_id, valor, data, conta_id, forma_pagamento, observacoes)
select v.id, 2500.00, '2026-10-10', ct.id, 'Boleto', 'Parcela 2/4.'
from public.vendas v
join public.contas ct on ct.nome = 'Nubank — Conta Digital'
where v.numero = 'VEN-2026-1002'
  and not exists (
    select 1 from public.entradas e where e.venda_id = v.id and e.observacoes = 'Parcela 2/4.'
  );

-- Garante que valor_pago bata com a soma das entradas
update public.vendas v
set valor_pago = sub.total
from (
  select venda_id, sum(valor) as total
  from public.entradas
  group by venda_id
) sub
where sub.venda_id = v.id and v.valor_pago is distinct from sub.total;
