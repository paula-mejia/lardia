# Lardia — Calculation Logic Reference

Complete documentation of all Brazilian domestic employer calculation modules in `src/lib/calc/`.

> **Tax table year:** 2026 (effective 2026-01-01, minimum wage R$1,518.00)

---

## Table of Contents

1. [Tax Tables](#1-tax-tables)
2. [Monthly Payroll](#2-monthly-payroll)
3. [13th Salary (Décimo Terceiro)](#3-13th-salary-décimo-terceiro)
4. [Vacation (Férias)](#4-vacation-férias)
5. [Termination (Rescisão)](#5-termination-rescisão)
6. [Shared Utilities](#6-shared-utilities)
7. [Module Exports](#7-module-exports)

---

## 1. Tax Tables

**Source:** `src/lib/calc/tax-tables.ts`

### 1.1 INSS Employee Brackets (Progressive)

Each bracket applies **only** to the portion of salary within that range (progressive, not flat).

| Bracket | Min (R$) | Max (R$) | Rate |
|---------|----------|----------|------|
| 1 | 0.00 | 1,518.00 | 7.5% |
| 2 | 1,518.01 | 2,793.88 | 9.0% |
| 3 | 2,793.89 | 4,190.83 | 12.0% |
| 4 | 4,190.84 | 8,157.41 | 14.0% |

Salary above R$8,157.41 is **not** subject to INSS (ceiling applies implicitly since the last bracket caps at that value).

### 1.2 INSS Employer Rates

| Component | Rate | Description |
|-----------|------|-------------|
| CP Patronal | 8.0% | Employer INSS contribution |
| GILRAT/RAT | 0.8% | Accident insurance |

### 1.3 FGTS Rates

| Component | Rate | Description |
|-----------|------|-------------|
| Monthly | 8.0% | Regular monthly deposit |
| Anticipation | 3.2% | Anticipation of termination penalty (antecipação multa rescisória) |

### 1.4 IRRF Brackets

| Bracket | Min (R$) | Max (R$) | Rate | Deduction (R$) |
|---------|----------|----------|------|----------------|
| 1 (exempt) | 0.00 | 2,259.20 | 0% | 0.00 |
| 2 | 2,259.21 | 2,826.65 | 7.5% | 169.44 |
| 3 | 2,826.66 | 3,751.05 | 15.0% | 381.44 |
| 4 | 3,751.06 | 4,664.68 | 22.5% | 662.77 |
| 5 | 4,664.69 | ∞ | 27.5% | 896.00 |

**Dependent deduction:** R$189.59 per dependent (subtracted from IRRF base before applying brackets).

### 1.5 API

- `getTaxTable(year: number): TaxTable` — Returns the table for a given year; throws if unavailable.
- `CURRENT_TAX_TABLE` — Alias for `TAX_TABLE_2026`.

---

## 2. Monthly Payroll

**Source:** `src/lib/calc/payroll.ts`

### 2.1 Inputs (`PayrollInput`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `grossSalary` | `number` | *required* | Monthly gross salary (R$) |
| `dependents` | `number` | `0` | Number of dependents for IRRF |
| `overtimeHours` | `number` | `0` | Hours of overtime worked |
| `overtimeRate` | `number` | `1.5` | Overtime multiplier (1.5 = 50% adicional) |
| `absenceDays` | `number` | `0` | Unexcused absence days |
| `dsrAbsenceDays` | `number` | `0` | DSR (rest) days lost due to absences |
| `otherDeductions` | `number` | `0` | Additional deductions (R$) |
| `otherEarnings` | `number` | `0` | Additional earnings (R$) |
| `taxTable` | `TaxTable` | current | Override tax table |

### 2.2 Calculation Steps

#### Step 1: Derived Rates
```
dailyRate  = grossSalary / 30        (commercial month, always 30 days)
hourlyRate = grossSalary / 220       (standard full-time monthly hours)
```

#### Step 2: Overtime Pay
```
overtimePay = overtimeHours × hourlyRate × overtimeRate
```

#### Step 3: Absence Deductions
```
absenceDeduction = absenceDays × dailyRate
dsrDeduction     = dsrAbsenceDays × dailyRate
```

#### Step 4: Total Earnings and Calculation Base
```
totalEarnings = grossSalary + overtimePay + otherEarnings
calcBase      = totalEarnings - absenceDeduction - dsrDeduction
```

#### Step 5: INSS Employee (Progressive)

INSS is calculated progressively across brackets. For each bracket:

```
bracketSize       = bracket.max - (bracket.min > 0 ? bracket.min - 0.01 : 0)
taxableInBracket  = min(remaining, bracketSize)
contribution      = taxableInBracket × (rate / 100)
remaining        -= taxableInBracket
```

Total INSS = sum of contributions from all applicable brackets.

**Example** for salary R$3,000.00:
- Bracket 1: R$1,518.00 × 7.5% = R$113.85
- Bracket 2: (R$2,793.88 − R$1,518.00) × 9% = R$1,275.88 × 9% = R$114.83
- Bracket 3: (R$3,000.00 − R$2,793.88) × 12% = R$206.12 × 12% = R$24.73
- **Total INSS: R$253.41**

#### Step 6: IRRF (Income Tax)
```
irrfBase = calcBase - inssEmployee - (dependents × 189.59)
```
Find the bracket where `irrfBase` falls, then:
```
irrf = irrfBase × (rate / 100) - deduction
irrf = max(0, irrf)
```
If `irrfBase ≤ 0`, IRRF = 0.

#### Step 7: Total Deductions and Net Salary
```
totalDeductions = inssEmployee + irrfEmployee + absenceDeduction + dsrDeduction + otherDeductions
netSalary       = totalEarnings - totalDeductions
```

#### Step 8: Employer Costs
```
inssEmployer    = calcBase × 8.0%    (CP Patronal)
gilrat          = calcBase × 0.8%    (accident insurance)
fgtsMonthly     = calcBase × 8.0%
fgtsAnticipation = calcBase × 3.2%
```

#### Step 9: DAE Total (Monthly Government Payment)
```
daeTotal = inssEmployee + inssEmployer + gilrat + fgtsMonthly + fgtsAnticipation
```

#### Step 10: Total Employer Cost
```
totalEmployerCost = calcBase + inssEmployer + gilrat + fgtsMonthly + fgtsAnticipation
```

### 2.3 Output (`PayrollBreakdown`)

| Field | Description |
|-------|-------------|
| `grossSalary` | Input gross salary |
| `overtimePay` | Calculated overtime |
| `otherEarnings` | Pass-through |
| `totalEarnings` | Sum of all earnings |
| `inssEmployee` | Employee INSS total |
| `inssEmployeeDetails` | Per-bracket breakdown `{bracket, amount}[]` |
| `irrfEmployee` | Employee IRRF |
| `irrfBase` | IRRF calculation base |
| `absenceDeduction` | Absence deduction |
| `dsrDeduction` | DSR deduction |
| `otherDeductions` | Pass-through |
| `totalDeductions` | Sum of all deductions |
| `netSalary` | Employee take-home pay |
| `inssEmployer` | Employer INSS (8%) |
| `gilrat` | Accident insurance (0.8%) |
| `fgtsMonthly` | FGTS deposit (8%) |
| `fgtsAnticipation` | FGTS anticipation (3.2%) |
| `daeTotal` | Total DAE payment |
| `daeBreakdown` | Itemized DAE components |
| `totalEmployerCost` | calcBase + all employer charges |

### 2.4 Edge Cases

- **Overtime rate** defaults to 1.5 (50% adicional) if not specified.
- **IRRF base ≤ 0**: Tax is 0 (low salary + many dependents).
- **Absence deductions** reduce the `calcBase` used for INSS/IRRF/FGTS (employer pays less on reduced base).
- All monetary values are **rounded to 2 decimal places** (`Math.round(v * 100) / 100`).

### 2.5 Legal Basis

- **Commercial month of 30 days**: Standard practice for CLT daily rate calculation.
- **220 hours/month**: CLT art. 58 + art. 7 (44h/week × 5 weeks).
- **INSS progressive brackets**: Reforma da Previdência (EC 103/2019), updated annually by Portaria Interministerial.
- **FGTS 8%**: Lei 8.036/1990.
- **FGTS anticipation 3.2%**: LC 150/2015, art. 22 (specific to domestic workers).
- **DAE (Documento de Arrecadação do eSocial)**: LC 150/2015, art. 34.

---

## 3. 13th Salary (Décimo Terceiro)

**Source:** `src/lib/calc/thirteenth.ts`

### 3.1 Inputs (`ThirteenthInput`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `monthlySalary` | `number` | *required* | Current monthly salary |
| `monthsWorked` | `number` | *required* | Months with 15+ days worked (1–12) |
| `dependents` | `number` | `0` | Dependents for IRRF |
| `averageOvertimePay` | `number` | `0` | Monthly average overtime (habitual) |
| `taxTable` | `TaxTable` | current | Override tax table |

### 3.2 Calculation Steps

#### Step 1: Proportional Base
```
proportionalBase = monthlySalary / 12 × monthsWorked
totalBase        = proportionalBase + averageOvertimePay
```

#### Step 2: First Installment (Adiantamento)
```
firstInstallment = totalBase / 2
```
- **No deductions** (INSS/IRRF) on the first installment.
- **Deadline:** November 30.

#### Step 3: Second Installment (Parcela Final)
```
secondInstallmentGross = totalBase - firstInstallment
```

INSS is calculated on the **full `totalBase`** (not just the second installment), but deducted entirely from the second installment:
```
inssEmployee = calculateINSSEmployee(totalBase)   // progressive
irrfEmployee = calculateIRRF(totalBase, inssEmployee, dependents)
secondInstallmentNet = secondInstallmentGross - inssEmployee - irrfEmployee
```
- **Deadline:** December 20.

#### Step 4: FGTS per Installment
```
fgtsFirstInstallment  = firstInstallment × 8%
fgtsSecondInstallment = secondInstallmentGross × 8%
fgtsMonthly           = fgtsFirstInstallment + fgtsSecondInstallment
```

#### Step 5: Employer Costs
```
inssEmployer    = totalBase × 8%
gilrat          = totalBase × 0.8%
fgtsAnticipation = totalBase × 3.2%
```

#### Step 6: Totals
```
totalEmployeePay  = firstInstallment + secondInstallmentNet
totalEmployerCost = totalBase + inssEmployer + gilrat + fgtsMonthly + fgtsAnticipation
```

### 3.3 Helper: `calculateMonthsWorked(admissionDate, referenceYear)`

Determines how many months count for proportional 13th:
- If admitted **before** the reference year → **12 months**.
- If admitted **in** the reference year: first month counts if admission day ≤ 15; then count remaining full months.
- If admitted **after** the reference year → **0 months**.

### 3.4 Output (`ThirteenthBreakdown`)

Contains: `proportionalBase`, `totalBase`, `firstInstallment`, `secondInstallmentGross`, `secondInstallmentNet`, INSS/IRRF details, FGTS per installment, employer costs, deadlines, and totals.

### 3.5 Edge Cases

- **IRRF on 13th is separate** from monthly IRRF — calculated independently on the full 13th base.
- **INSS applies to full base** but is deducted only from the 2nd installment.
- **Habitual overtime** (`averageOvertimePay`) is added to the base per jurisprudence.

### 3.6 Legal Basis

- **Two installments**: Lei 4.749/1965.
- **1st by Nov 30, 2nd by Dec 20**: Lei 4.749/1965, arts. 1–2.
- **15-day rule for month counting**: Standard labor practice.
- **Separate IRRF calculation**: RIR/2018, art. 677 (13th taxed separately from regular income).

---

## 4. Vacation (Férias)

**Source:** `src/lib/calc/vacation.ts`

### 4.1 Inputs (`VacationInput`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `monthlySalary` | `number` | *required* | Current monthly salary |
| `absences` | `number` | *required* | Unexcused absences during acquisition period |
| `daysSold` | `number` | *required* | Days sold as abono pecuniário (0–10) |
| `proportionalMonths` | `number` | `undefined` | If < 12, calculates proportional vacation |
| `dependents` | `number` | `0` | Dependents for IRRF |
| `vacationStartDate` | `string` | `undefined` | ISO date for payment deadline calculation |
| `taxTable` | `TaxTable` | current | Override tax table |

### 4.2 Calculation Steps

#### Step 1: Vacation Days Entitlement (CLT art. 130)

| Unexcused Absences | Vacation Days |
|--------------------|---------------|
| 0–5 | 30 |
| 6–14 | 24 |
| 15–23 | 18 |
| 24–32 | 12 |
| 33+ | 0 |

#### Step 2: Proportional Adjustment
```
if proportional:
  totalVacationDays = fullVacationDays / 12 × proportionalMonths
else:
  totalVacationDays = fullVacationDays
```

#### Step 3: Days Sold (Abono Pecuniário)
```
effectiveDaysSold = min(daysSold, floor(totalVacationDays / 3), 10)
daysEnjoyed       = totalVacationDays - effectiveDaysSold
```
Employee may sell up to 1/3 of vacation days, capped at 10.

#### Step 4: Vacation Pay
```
dailyRate            = monthlySalary / 30
vacationPay          = daysEnjoyed × dailyRate
terçoConstitucional  = vacationPay / 3
abonoPay             = effectiveDaysSold × dailyRate
abonoTerço           = abonoPay / 3
totalGross           = vacationPay + terçoConstitucional + abonoPay + abonoTerço
```

#### Step 5: Deductions (INSS + IRRF)

**Important:** INSS and IRRF apply **only** to `vacationPay + terçoConstitucional`. The abono pecuniário (sold days + its 1/3) is **exempt** from INSS and IRRF.

```
inssBase     = vacationPay + terçoConstitucional
inssEmployee = calculateINSSEmployee(inssBase)
irrfEmployee = calculateIRRF(inssBase, inssEmployee, dependents)
totalDeductions = inssEmployee + irrfEmployee
```

#### Step 6: Net Payment
```
netPayment = totalGross - totalDeductions
```

#### Step 7: FGTS
```
fgtsDue = inssBase × 8%     (on vacationPay + terço only, not abono)
```

#### Step 8: Payment Deadline
```
paymentDeadline = vacationStartDate - 2 calendar days
```

### 4.3 Output (`VacationBreakdown`)

Contains: day counts, vacation pay, terço constitucional, abono pay/terço, gross/net totals, INSS/IRRF details, FGTS, payment deadline, and proportional flag.

### 4.4 Edge Cases

- **33+ absences**: Employee loses the right to vacation entirely (0 days).
- **Abono capped at 1/3 of entitled days** AND at 10 days (whichever is smaller).
- **Proportional vacation**: Used at termination (< 12 months in acquisition period).
- **Abono pecuniário is tax-exempt**: No INSS or IRRF on sold days.

### 4.5 Legal Basis

- **30 days paid vacation**: CLT art. 129; CF/88 art. 7, XVII.
- **1/3 constitutional bonus (terço)**: CF/88 art. 7, XVII.
- **Abono pecuniário (sell up to 1/3)**: CLT art. 143.
- **Absence reduction table**: CLT art. 130.
- **Payment 2 days before**: CLT art. 145.

---

## 5. Termination (Rescisão)

**Source:** `src/lib/calc/termination.ts`

### 5.1 Termination Types

| Type | Label | Description |
|------|-------|-------------|
| `sem_justa_causa` | Dispensa sem justa causa | Dismissal without cause (employer-initiated) |
| `pedido_demissao` | Pedido de demissão | Employee resignation |
| `justa_causa` | Dispensa por justa causa | Dismissal for cause |

### 5.2 Inputs (`TerminationInput`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `terminationType` | `TerminationType` | *required* | One of the three types above |
| `lastSalary` | `number` | *required* | Last monthly salary |
| `admissionDate` | `string` | *required* | YYYY-MM-DD |
| `terminationDate` | `string` | *required* | YYYY-MM-DD |
| `dependents` | `number` | `0` | Dependents for IRRF |
| `fgtsBalance` | `number` | `0` | Estimated accumulated FGTS balance |
| `accruedVacationPeriods` | `number` | `0` | Complete vacation periods not yet taken (0, 1, or 2) |
| `workedNoticePeriod` | `boolean` | `false` | Whether notice period was worked (sem_justa_causa only) |
| `employeeGaveNotice` | `boolean` | `true` | Whether employee gave 30-day notice (pedido_demissao only) |
| `taxTable` | `TaxTable` | current | Override tax table |

### 5.3 Calculation Steps

#### Step 1: Saldo de Salário (All Types)

Salary for days worked in the final month:
```
saldoDays    = day-of-month of terminationDate
saldoSalario = saldoDays × (lastSalary / 30)
```

#### Step 2: Aviso Prévio

**Sem justa causa:**
```
avisoPrevioDays = 30 + (yearsWorked × 3)     // max 90 days
```
- If **not worked** (indemnified): employer pays `dailyRate × avisoPrevioDays`. The projected end date (termination + aviso days) is used for 13th proportional calculation.
- If **worked**: no extra payment (already included in regular salary).

**Pedido de demissão:**
- If employee **did not give 30-day notice**: employer deducts `dailyRate × 30` from termination pay.

**Justa causa:** No aviso prévio.

#### Step 3: Proportional 13th Salary

*Not applicable for justa causa.*

```
thirteenthMonths = months worked in the termination year (or projected year if indemnified aviso)
thirteenthProportional = lastSalary / 12 × thirteenthMonths
```

Month counting rules:
- First month of the year: counts if admission day ≤ 15.
- Last month (termination): counts if termination day ≥ 15.
- All months in between: count fully.
- For indemnified aviso prévio, the **projected end date** (termination + aviso days) is used.

#### Step 4: Proportional Vacation + 1/3

*Not applicable for justa causa.*

Counts months from last vacation anniversary to termination date:
```
vacationProportional        = lastSalary / 12 × vacationProportionalMonths
vacationProportionalOneThird = vacationProportional / 3
```

#### Step 5: Accrued (Vencidas) Vacation + 1/3 (All Types)

For each complete acquisition period where vacation was not taken:
```
accruedVacation         = lastSalary × accruedVacationPeriods
accruedVacationOneThird = accruedVacation / 3
```

Even in justa causa, accrued (vencidas) vacations must be paid.

#### Step 6: Total Earnings
```
totalEarnings = saldoSalario + avisoPrevio + thirteenthProportional
              + vacationProportional + vacationProportionalOneThird
              + accruedVacation + accruedVacationOneThird
```

#### Step 7: INSS and IRRF

INSS base includes:
- Saldo de salário
- Aviso prévio **only if worked** (indemnified aviso is INSS-exempt)
- 13th proportional

**Vacation amounts are exempt from INSS.**

```
inssBase = saldoSalario + (workedAviso ? lastSalary : 0) + thirteenthProportional
inssEmployee = calculateINSSEmployee(inssBase)
irrfEmployee = calculateIRRF(inssBase, inssEmployee, dependents)
```

#### Step 8: Total Deductions
```
totalDeductions = inssEmployee + irrfEmployee + avisoPrevioDeduction
```
(`avisoPrevioDeduction` > 0 only for pedido_demissao when employee didn't give notice)

#### Step 9: FGTS on Termination
```
fgtsBase          = saldoSalario + avisoPrevio + thirteenthProportional
fgtsOnTermination = fgtsBase × 8%
totalFgtsBalance  = fgtsBalance + fgtsOnTermination
```

#### Step 10: FGTS 40% Penalty (Sem Justa Causa Only)
```
fgtsPenalty = totalFgtsBalance × 40%
```

Only applies to dismissal without cause. Employee resignation and justa causa: penalty = 0.

#### Step 11: Net Amounts
```
netAmount      = totalEarnings - totalDeductions
totalToReceive = netAmount + fgtsPenalty
```

### 5.4 Entitlements by Termination Type

| Component | Sem Justa Causa | Pedido Demissão | Justa Causa |
|-----------|:-:|:-:|:-:|
| Saldo de salário | ✅ | ✅ | ✅ |
| Aviso prévio (paid/indemnified) | ✅ | ❌ (may be deducted) | ❌ |
| 13th proportional | ✅ | ✅ | ❌ |
| Vacation proportional + 1/3 | ✅ | ✅ | ❌ |
| Accrued vacation + 1/3 | ✅ | ✅ | ✅ |
| FGTS on termination | ✅ | ✅ | ✅ |
| FGTS 40% penalty | ✅ | ❌ | ❌ |
| FGTS withdrawal | ✅ | ❌ | ❌ |

### 5.5 Output (`TerminationBreakdown`)

Contains: termination type/label, dates, years/months worked, all earning line items, INSS/IRRF details, aviso prévio deduction, FGTS (on termination + balance + penalty), net amount, and total to receive.

### 5.6 Edge Cases

- **Aviso prévio max 90 days**: Capped regardless of tenure.
- **Projected end date for indemnified aviso**: Extends the date used for 13th proportional month counting.
- **Justa causa**: Only saldo de salário and accrued (vencidas) vacation are paid. No 13th proportional, no vacation proportional, no FGTS penalty.
- **Employee resignation without notice**: 30-day salary deducted from termination pay.
- **INSS exemption on indemnified aviso prévio**: Indemnified aviso is not subject to INSS.
- **Vacation exempt from INSS**: All vacation amounts (proportional and accrued) are excluded from INSS base.

### 5.7 Legal Basis

- **Aviso prévio 30 + 3/year (max 90)**: Lei 12.506/2011.
- **FGTS 40% penalty**: CLT art. 18, §1º of Lei 8.036/1990.
- **Proportional 13th on termination**: Lei 4.090/1962, art. 3.
- **Accrued vacation even in justa causa**: CLT art. 146, parágrafo único.
- **FGTS anticipation 3.2% for domestics**: LC 150/2015, art. 22.
- **Indemnified aviso prévio exempt from INSS**: Decreto 3.048/1999, art. 214.

---

## 6. Shared Utilities

### 6.1 Rounding

All modules use the same rounding function:

```typescript
function round(value: number): number {
  return Math.round(value * 100) / 100
}
```

This applies **banker's rounding to 2 decimal places** (standard JS `Math.round` behavior — rounds 0.5 up).

### 6.2 Currency Formatting

```typescript
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
```

Used internally for bracket labels in INSS details.

### 6.3 Shared Functions

`calculateINSSEmployee` and `calculateIRRF` from `payroll.ts` are reused by the 13th salary, vacation, and termination modules.

---

## 7. Module Exports

**Source:** `src/lib/calc/index.ts`

### Functions
| Export | Source |
|--------|--------|
| `calculatePayroll` | payroll.ts |
| `calculateINSSEmployee` | payroll.ts |
| `calculateIRRF` | payroll.ts |
| `calculateThirteenth` | thirteenth.ts |
| `calculateMonthsWorked` | thirteenth.ts |
| `calculateVacation` | vacation.ts |
| `getVacationDaysByAbsences` | vacation.ts |
| `getPaymentDeadline` | vacation.ts |
| `calculateTermination` | termination.ts |
| `getTaxTable` | tax-tables.ts |
| `CURRENT_TAX_TABLE` | tax-tables.ts |
| `TAX_TABLE_2026` | tax-tables.ts |

### Types
| Export | Source |
|--------|--------|
| `PayrollInput`, `PayrollBreakdown` | payroll.ts |
| `ThirteenthInput`, `ThirteenthBreakdown` | thirteenth.ts |
| `VacationInput`, `VacationBreakdown` | vacation.ts |
| `TerminationInput`, `TerminationBreakdown`, `TerminationType` | termination.ts |
| `TaxTable`, `INSSBracket`, `IRRFBracket` | tax-tables.ts |
