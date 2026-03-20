from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap


BASE_DIR = Path(__file__).resolve().parent
SCORED_FILE = BASE_DIR / "bank_customers_scored.csv"
MODEL_FILE = BASE_DIR / "model.pkl"
FEATURE_COLUMNS_FILE = BASE_DIR / "feature_columns.pkl"
SHAP_EXPLAINER_FILE = BASE_DIR / "shap_explainer.pkl"
FINAL_FILE = BASE_DIR / "bank_customers_final.csv"


HUMAN_LABELS = {
	"salary_credit_flag": "Salary credit ruk gayi",
	"days_since_last_transaction": "Bahut din se inactive",
	"complaint_count_6m": "Zyada complaints",
	"balance_trend_3m": "Balance gir raha hai",
	"mobile_app_logins_monthly": "App use nahi kar raha",
	"products_held": "Sirf ek product",
	"engagement_score": "Digital engagement low",
	"nps_score": "Customer satisfied nahi",
}


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
	output = df.copy()

	output["engagement_score"] = (
		output["mobile_app_logins_monthly"] * 0.3
		+ output["monthly_transactions"] * 0.3
		+ output["net_banking_logins_monthly"] * 0.2
		+ output["upi_transactions_monthly"] * 0.2
	)

	output["financial_stress"] = (
		(output["avg_balance_inr"] < 5000).astype(int)
		+ (output["balance_trend_3m"] < -0.3).astype(int)
		+ (output["days_since_last_transaction"] > 45).astype(int)
	)

	output["relationship_depth"] = (
		output["products_held"]
		+ output["has_credit_card"]
		+ output["has_loan"]
		+ output["has_fd_rd"]
		+ output["has_insurance"]
	)

	resolved_ratio = (output["complaint_resolved_pct"] / 100.0).clip(0, 1)
	output["complaint_severity"] = output["complaint_count_6m"] * (1 - resolved_ratio)

	output["rfm_score"] = (
		(1.0 / (output["days_since_last_transaction"] + 1)) * 100
		+ output["monthly_transactions"]
		+ np.log1p(output["avg_balance_inr"]) * 2
	)

	output["digital_engagement_ratio"] = (
		output["mobile_app_logins_monthly"]
		+ output["net_banking_logins_monthly"]
		+ output["upi_transactions_monthly"]
	) / (output["monthly_transactions"] + 1)

	output["inactivity_value_risk"] = (
		output["days_since_last_transaction"]
		* (1 - output["balance_trend_3m"].clip(-1, 1))
	)

	output["stress_complaint_index"] = output["financial_stress"] * (output["complaint_severity"] + 1)

	return output


def make_model_features(df: pd.DataFrame, feature_columns: list[str]) -> pd.DataFrame:
	engineered = add_engineered_features(df)
	X = engineered.drop(columns=["churn_label", "customer_id", "customer_name", "risk_score", "risk_tier"], errors="ignore")
	X_encoded = pd.get_dummies(X, columns=["account_type", "preferred_channel"], drop_first=False)
	return X_encoded.reindex(columns=feature_columns, fill_value=0)


def humanize_feature_name(feature_name: str) -> str:
	return HUMAN_LABELS.get(feature_name, feature_name)


def extract_shap_values(explainer_output: np.ndarray | list[np.ndarray]) -> np.ndarray:
	if isinstance(explainer_output, list):
		if len(explainer_output) == 1:
			return np.asarray(explainer_output[0])
		return np.asarray(explainer_output[1])

	shap_values = np.asarray(explainer_output)
	if shap_values.ndim == 3:
		return shap_values[:, :, 1]
	return shap_values


def top_3_factors_for_row(row_shap_values: np.ndarray, feature_columns: list[str]) -> tuple[str, float, str, float, str, float]:
	indices = np.argsort(np.abs(row_shap_values))[::-1][:3]

	factors = []
	for idx in indices:
		feature_name = feature_columns[idx]
		human_name = humanize_feature_name(feature_name)
		factors.append((human_name, float(row_shap_values[idx])))

	while len(factors) < 3:
		factors.append(("N/A", 0.0))

	return (
		factors[0][0], round(factors[0][1], 4),
		factors[1][0], round(factors[1][1], 4),
		factors[2][0], round(factors[2][1], 4),
	)


def main() -> None:
	df_scored = pd.read_csv(SCORED_FILE)
	model = joblib.load(MODEL_FILE)
	feature_columns: list[str] = joblib.load(FEATURE_COLUMNS_FILE)

	X_all = make_model_features(df_scored, feature_columns)

	explainer = shap.TreeExplainer(model)
	joblib.dump(explainer, SHAP_EXPLAINER_FILE)

	shap_output = explainer.shap_values(X_all)
	shap_values = extract_shap_values(shap_output)

	results = [top_3_factors_for_row(shap_values[i], feature_columns) for i in range(len(df_scored))]

	df_scored["shap_factor_1"] = [r[0] for r in results]
	df_scored["shap_value_1"] = [r[1] for r in results]
	df_scored["shap_factor_2"] = [r[2] for r in results]
	df_scored["shap_value_2"] = [r[3] for r in results]
	df_scored["shap_factor_3"] = [r[4] for r in results]
	df_scored["shap_value_3"] = [r[5] for r in results]

	df_scored.to_csv(FINAL_FILE, index=False)

	print(f"Loaded model: {MODEL_FILE}")
	print(f"Saved SHAP explainer: {SHAP_EXPLAINER_FILE}")
	print(f"Saved final file with SHAP factors: {FINAL_FILE}")


if __name__ == "__main__":
	main()