# eSocial RPA Selectors & Flow (Módulo Simplificado Pessoa Física)

## Source: Manual do Empregador Doméstico v09/01/2026 (185 pages)

## Navigation Menu
```
Empregador/Contribuinte >
  - Dados do Empregador/Contribuinte
  - Acesso ao Sistema CAEPF
  - Acesso ao Sistema CNO
  - Consultar Eventos Por Recibo

Empregados >
  - Admitir/Cadastrar
  - Gestão dos Empregados
  - Informe de Rendimentos
  - Substituição do Empregador Doméstico (Representante da Unidade Familiar)

Folha de Pagamento >
  - Dados de Folha de Pagamento
  - Parcelamento do FGTS >
  - Consultar Guias Pagas

Ajuda >
  - Tutoriais em vídeo
  - Manual
  - Perguntas Frequentes
```

## Quick Access (Home Page)
- "Folha de Pagamento" button
- "Gestão dos Empregados" button

## Monthly Flow: Folha de Pagamento → Encerrar → DAE

### Step 1: Navigate to Folha
- Menu: Folha de Pagamento → Dados de Folha de Pagamento
- URL pattern: /portal/... (SPA, routes may be Angular/JS based)

### Step 2: Select Competência (Month/Year)
- Year tabs at top, month buttons below
- States per month: Aberto, Encerrado, Sem movimentação, Sem trabalhadores
- Click on desired month to open

### Step 3: Edit Remuneração (if needed)
- Click on employee name to edit
- Default: salary auto-filled from contract
- Can add: horas extras, adicional noturno, faltas, atrasos, DSR
- Key rubricas (eSocial codes):
  - eSocial1000: Salário
  - eSocial1200: DSR
  - eSocial1800: 13º adiantamento
  - eSocial1810: 13º salário
  - eSocial5040: 13º desconto 1ª parcela
  - eSocial3500-3507: Retroativo (diferenças)
  - eSocial1740: Auxílio-doença acidentário
- Button: "Salvar Remuneração"

### Step 4: Encerrar Folha
- Button: "Encerrar Folha"
- Confirmation dialog expected

### Step 5: Emitir Guia DAE
- Button: "Emitir Guia" (appears after encerramento)
- Optional: "acesse a página de Edição de Guia" to customize
- Can select/deselect tributos
- Can edit individual values
- DAE generated as PDF
- Vencimento: dia 7 do mês seguinte (antecipado se não útil)
- Payment methods: boleto bancário or PIX (QR code on DAE)

### Step 6: Print Recibos
- Available from folha page after encerramento
- "Impressão de recibos de pagamentos de salários simplificados e relatórios consolidados"

## DAE Composition (employer costs)
- 8% INSS patronal (CP)
- 0.8% GILRAT (accident insurance)
- 8% FGTS
- 3.2% FGTS antecipação (compensatória)
- Employee deductions: INSS 7.5%-14% progressive + IRRF if applicable

## Reabrir Folha
- Navigate to competência → "Reabrir Folha" button
- After edit: must re-encerrar + re-emit DAE
- Previous DAE payments must be manually abated

## 13º Salário Flow
- Adiantamento (1ª parcela): paid until Nov 30
  - Use rubrica eSocial1800 in the month of payment
  - DAE includes FGTS on adiantamento
- 2ª parcela: Folha de 13º Salário (separate from December folha)
  - Must encerrar 13º folha BEFORE December folha
  - DAE for 13º: INSS + GILRAT on total 13º
  - December DAE: normal salary + FGTS on 2ª parcela + IRRF on 13º

## Férias Flow
- Menu: Empregados → Gestão dos Empregados → select employee → Férias
- Steps: Programar → Registrar gozo → System auto-calculates

## Desligamento Flow
- Menu: Empregados → Gestão dos Empregados → select employee → Desligamento
- Fill: date, type, aviso prévio details
- System calculates: saldo salário, férias proporcionais, 13º proporcional, FGTS multa

## Trocar Perfil/Módulo
- Top-right area: "Trocar Perfil/Módulo"
- Used to switch between PF and PJ modules
- Also used to act as procurador (representative) for another CPF/CNPJ

## Chatbot
- Bottom-right floating button
- Can: reajustar salário, fechar folhas, registrar férias, desligamento
- Useful for quick operations

## Technical Notes
- ASP.NET backend (IIS 10.0)
- Session: ASP.NET_SessionId cookie
- URL base: www.esocial.gov.br/portal/
- Login: login.esocial.gov.br via gov.br SSO
- Version shown: eSocial.RecepcaoEvento: 15.9.14 | eSocial.Web.Negocio: 3.15.30
- SPA with server-side rendering (ASP.NET MVC)
