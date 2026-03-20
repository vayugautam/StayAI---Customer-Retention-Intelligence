from pathlib import Path
import sys

import numpy as np
import pandas as pd
from faker import Faker


ROW_COUNT = 2000
TARGET_CHURN_RATE = 0.20
MIN_CHURN_RATE = 0.18
MAX_CHURN_RATE = 0.22
OUTPUT_FILE = Path(__file__).resolve().parent / "bank_customers.csv"
SEED = 42


faker = Faker("en_IN")
Faker.seed(SEED)


def clamp(value: float, low: float, high: float) -> float:
    return float(np.clip(value, low, high))


def choose_signal_set(rng: np.random.Generator, churn_target: int) -> set[str]:
    all_signals = [
        "days_since_last",
        "balance_trend",
        "salary_credit",
        "complaint_count",
        "mobile_logins",
        "products_held",
    ]
    signal_count = int(rng.choice([3, 4, 5], p=[0.62, 0.30, 0.08])) if churn_target else int(
        rng.choice([0, 1, 2], p=[0.18, 0.50, 0.32])
    )
    return set(rng.choice(all_signals, size=signal_count, replace=False))


def choose_name(generators: list[Faker], rng: np.random.Generator) -> str:
    generator = generators[int(rng.integers(0, len(generators)))]
    return generator.name()


def build_dataset(seed: int, churn_customer_count: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    name_generators = [Faker("en_IN")]
    name_generators[0].seed_instance(seed)

    rows = []
    churn_targets = np.array([1] * churn_customer_count + [0] * (ROW_COUNT - churn_customer_count))
    rng.shuffle(churn_targets)

    for idx, churn_target in enumerate(churn_targets, start=1):
        active_signals = choose_signal_set(rng, int(churn_target))

        account_type = rng.choice(["Savings", "Salary", "Current", "NRI"], p=[0.49, 0.29, 0.16, 0.06])
        city_tier = int(rng.choice([1, 2, 3], p=[0.41, 0.36, 0.23]))

        if account_type == "Salary":
            age = int(rng.integers(23, 58))
        elif account_type == "Savings":
            age = int(rng.integers(22, 66))
        elif account_type == "Current":
            age = int(rng.integers(27, 66))
        else:
            age = int(rng.integers(25, 66))

        salary_credit_flag = 0 if "salary_credit" in active_signals else 1

        tenure_months = int(rng.integers(3, 181))
        monthly_transactions = max(0, int(rng.poisson(18)))
        avg_balance_inr = clamp(rng.exponential(85000), 1500, 1500000)

        if "balance_trend" in active_signals:
            balance_trend_3m = clamp(rng.uniform(-0.50, -0.21), -0.50, 0.30)
        else:
            balance_trend_3m = clamp(rng.normal(0.01, 0.11), -0.19, 0.30)

        if "mobile_logins" in active_signals:
            mobile_app_logins_monthly = int(rng.integers(0, 3))
        else:
            mobile_app_logins_monthly = max(3, int(rng.poisson(14)))

        net_banking_logins_monthly = max(0, int(rng.poisson(8 if city_tier == 1 else 6)))

        if "complaint_count" in active_signals:
            complaint_count_6m = int(rng.integers(3, 7))
            complaint_resolved_pct = clamp(rng.normal(58, 16), 10, 95)
        else:
            complaint_count_6m = int(min(rng.poisson(0.9), 2))
            complaint_resolved_pct = clamp(rng.normal(86, 10), 45, 100)

        if "products_held" in active_signals:
            products_held = 1
        else:
            products_held = int(rng.choice([2, 3, 4, 5], p=[0.38, 0.34, 0.19, 0.09]))

        if "days_since_last" in active_signals:
            days_since_last_transaction = int(rng.integers(31, 121))
        else:
            days_since_last_transaction = int(rng.integers(0, 31))

        upi_transactions_monthly = max(0, int(rng.poisson(16 if city_tier in [1, 2] else 11)))
        nps_score = int(clamp(rng.normal(4.8, 1.8), 1, 10)) if churn_target else int(clamp(rng.normal(7.2, 1.6), 1, 10))

        preferred_channel = rng.choice(
            ["Mobile App", "Branch", "Net Banking", "Relationship Manager", "Call Center", "UPI"],
            p=[0.35, 0.17, 0.18, 0.07, 0.10, 0.13],
        )

        has_credit_card = int(rng.random() < (0.76 if products_held >= 3 else 0.58 if products_held == 2 else 0.24))
        has_loan = int(rng.random() < (0.21 if age < 28 else 0.34 if age <= 45 else 0.27))
        has_fd_rd = int(rng.random() < (0.16 if avg_balance_inr < 50000 else 0.39 if avg_balance_inr < 150000 else 0.63))
        has_insurance = int(rng.random() < (0.25 if age < 30 else 0.46 if age <= 50 else 0.58))

        rows.append(
            {
                "customer_id": f"CUST{idx:06d}",
                "customer_name": choose_name(name_generators, rng),
                "age": age,
                "account_type": account_type,
                "tenure_months": tenure_months,
                "monthly_transactions": monthly_transactions,
                "avg_balance_inr": round(avg_balance_inr, 2),
                "balance_trend_3m": round(balance_trend_3m, 3),
                "salary_credit_flag": salary_credit_flag,
                "mobile_app_logins_monthly": mobile_app_logins_monthly,
                "net_banking_logins_monthly": net_banking_logins_monthly,
                "complaint_count_6m": complaint_count_6m,
                "complaint_resolved_pct": round(complaint_resolved_pct, 1),
                "products_held": products_held,
                "has_credit_card": has_credit_card,
                "has_loan": has_loan,
                "has_fd_rd": has_fd_rd,
                "has_insurance": has_insurance,
                "days_since_last_transaction": days_since_last_transaction,
                "upi_transactions_monthly": upi_transactions_monthly,
                "nps_score": nps_score,
                "preferred_channel": preferred_channel,
                "city_tier": city_tier,
            }
        )

    df = pd.DataFrame(rows)

    signal_count = (
        (df["days_since_last_transaction"] > 30).astype(int)
        + (df["balance_trend_3m"] < -0.2).astype(int)
        + (df["salary_credit_flag"] == 0).astype(int)
        + (df["complaint_count_6m"] > 2).astype(int)
        + (df["mobile_app_logins_monthly"] < 3).astype(int)
        + (df["products_held"] == 1).astype(int)
    )

    df["churn_label"] = (signal_count >= 3).astype(int)
    return df


def generate_dataset() -> pd.DataFrame:
    target_churn_customers = int(ROW_COUNT * TARGET_CHURN_RATE)

    for offset in range(0, 101):
        for direction in (0, -1, 1):
            churn_customer_count = target_churn_customers + (offset * direction)
            if not 0 <= churn_customer_count <= ROW_COUNT:
                continue

            df = build_dataset(seed=SEED + offset, churn_customer_count=churn_customer_count)
            churn_rate = df["churn_label"].mean()
            if MIN_CHURN_RATE <= churn_rate <= MAX_CHURN_RATE:
                return df

    raise RuntimeError("Unable to generate a dataset within the required churn-rate range.")


def main() -> None:
    df = generate_dataset()
    churn_rate = df["churn_label"].mean()

    df.to_csv(OUTPUT_FILE, index=False)
    preview = df.head(8).to_string(index=False)
    stdout_encoding = sys.stdout.encoding or "utf-8"
    safe_preview = preview.encode(stdout_encoding, errors="replace").decode(stdout_encoding)

    print(f"Saved file: {OUTPUT_FILE}")
    print(f"Shape: {df.shape}")
    print(f"Churn rate: {churn_rate:.2%}")
    print("Sample rows:")
    print(safe_preview)


if __name__ == "__main__":
    main()
