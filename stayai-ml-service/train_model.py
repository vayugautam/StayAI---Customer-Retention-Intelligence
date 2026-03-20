from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from xgboost import XGBClassifier


BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "bank_customers.csv"
SCORED_FILE = BASE_DIR / "bank_customers_scored.csv"
MODEL_FILE = BASE_DIR / "model.pkl"
FEATURE_COLUMNS_FILE = BASE_DIR / "feature_columns.pkl"
SCALER_FILE = BASE_DIR / "scaler.pkl"
IMPORTANCE_PLOT_FILE = BASE_DIR / "feature_importance_top10.png"


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


def build_feature_matrix(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, list[str]]:
	model_df = add_engineered_features(df)

	y = model_df["churn_label"].astype(int)
	X = model_df.drop(columns=["churn_label", "customer_id", "customer_name"])

	categorical_columns = ["account_type", "preferred_channel"]
	X_encoded = pd.get_dummies(X, columns=categorical_columns, drop_first=False)

	feature_columns_list = X_encoded.columns.tolist()
	return X_encoded, y, feature_columns_list


def plot_feature_importance(model: XGBClassifier, feature_columns: list[str]) -> None:
	importance = pd.Series(model.feature_importances_, index=feature_columns)
	top_10 = importance.sort_values(ascending=False).head(10).sort_values(ascending=True)

	plt.figure(figsize=(10, 6))
	plt.barh(top_10.index, top_10.values)
	plt.title("Top 10 Feature Importances")
	plt.xlabel("Importance")
	plt.tight_layout()
	plt.savefig(IMPORTANCE_PLOT_FILE, dpi=150)
	plt.close()


def assign_risk_tier(risk_score: pd.Series) -> pd.Series:
	return np.select(
		[risk_score > 80, risk_score > 60, risk_score > 30],
		["Critical", "High", "Medium"],
		default="Low",
	)


def main() -> None:
	df = pd.read_csv(INPUT_FILE)

	X_encoded, y, feature_columns_list = build_feature_matrix(df)
	churn_count = int(y.sum())
	total_count = int(len(y))

	print(f"Current feature list ({len(feature_columns_list)}): {feature_columns_list}")
	print(f"Class distribution: {churn_count} / {total_count}")

	X_train, X_test, y_train, y_test = train_test_split(
		X_encoded,
		y,
		test_size=0.2,
		random_state=42,
		stratify=y,
	)

	positive_count = int(y_train.sum())
	negative_count = int(len(y_train) - positive_count)
	scale_pos_weight = negative_count / max(positive_count, 1)

	try:
		smote = SMOTE(random_state=42)
		X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
		imbalance_method = "SMOTE + scale_pos_weight"
	except ValueError:
		X_train_resampled, y_train_resampled = X_train, y_train
		imbalance_method = "scale_pos_weight only"

	base_model = XGBClassifier(
		random_state=42,
		eval_metric="logloss",
		scale_pos_weight=scale_pos_weight,
		subsample=0.9,
		colsample_bytree=0.9,
	)

	param_grid = {
		"n_estimators": [150, 200, 300],
		"max_depth": [4, 5, 6],
		"learning_rate": [0.03, 0.05, 0.08],
	}

	grid = GridSearchCV(
		estimator=base_model,
		param_grid=param_grid,
		scoring="roc_auc",
		cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
		n_jobs=-1,
		verbose=0,
	)

	grid.fit(X_train_resampled, y_train_resampled)
	model = grid.best_estimator_

	print(
		"Current model config: "
		f"{grid.best_params_}, scale_pos_weight={scale_pos_weight:.4f}, imbalance={imbalance_method}"
	)

	y_proba = model.predict_proba(X_test)[:, 1]
	y_pred = (y_proba >= 0.5).astype(int)

	roc_auc = roc_auc_score(y_test, y_proba)
	precision = precision_score(y_test, y_pred)
	recall = recall_score(y_test, y_pred)
	f1 = f1_score(y_test, y_pred)

	print(f"ROC-AUC: {roc_auc:.4f}")
	print(f"Precision: {precision:.4f}")
	print(f"Recall: {recall:.4f}")
	print(f"F1: {f1:.4f}")

	plot_feature_importance(model, feature_columns_list)
	print(f"Feature importance plot saved: {IMPORTANCE_PLOT_FILE}")

	scaler_if_used = None
	joblib.dump(model, MODEL_FILE)
	joblib.dump(feature_columns_list, FEATURE_COLUMNS_FILE)
	joblib.dump(scaler_if_used, SCALER_FILE)

	all_proba = model.predict_proba(X_encoded)[:, 1]
	risk_score = (all_proba * 100).round(2)
	risk_tier = assign_risk_tier(risk_score)

	scored_df = df.copy()
	scored_df["risk_score"] = risk_score
	scored_df["risk_tier"] = risk_tier
	scored_df.to_csv(SCORED_FILE, index=False)

	print(f"Model saved: {MODEL_FILE}")
	print(f"Feature columns saved: {FEATURE_COLUMNS_FILE}")
	print(f"Scaler saved: {SCALER_FILE}")
	print(f"Scored data saved: {SCORED_FILE}")


if __name__ == "__main__":
	main()
