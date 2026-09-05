"""Train and export the EduStats v2 predictive baseline.

The script is intentionally offline: it reads generated-test-data/**/students-raw.csv,
uses final/overall subject scores as features, and writes an ONNX classifier when
scikit-learn, pandas, skl2onnx, and onnxruntime are installed.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType


def load_dataset(data_dir: Path) -> tuple[np.ndarray, np.ndarray]:
    frames = []
    for path in sorted(data_dir.glob("**/students-raw.csv")):
        frame = pd.read_csv(path)
        subject_columns = [column for column in frame.columns if column.endswith("::overall_score")]
        if not subject_columns or "grade" not in frame:
            continue
        features = frame[subject_columns].apply(pd.to_numeric, errors="coerce").fillna(0).to_numpy(dtype=np.float32)
        labels = frame["grade"].fillna("U").astype(str).to_numpy()
        frames.append((features, labels))
    if not frames:
        raise SystemExit(f"No usable students-raw.csv files found under {data_dir}")
    return np.vstack([item[0] for item in frames]), np.concatenate([item[1] for item in frames])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("generated-test-data"))
    parser.add_argument("--output", type=Path, default=Path("models/edustats_v2.onnx"))
    args = parser.parse_args()
    X, y = load_dataset(args.data_dir)
    model = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42, class_weight="balanced")
    folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    predictions = cross_val_predict(model, X, y, cv=folds)
    print(classification_report(y, predictions, zero_division=0))
    print({"precision": precision_score(y, predictions, average="weighted", zero_division=0), "recall": recall_score(y, predictions, average="weighted", zero_division=0), "f1": f1_score(y, predictions, average="weighted", zero_division=0)})
    model.fit(X, y)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    onnx_model = convert_sklearn(model, initial_types=[("features", FloatTensorType([None, X.shape[1]]))], options={id(model): {"zipmap": False}})
    args.output.write_bytes(onnx_model.SerializeToString())
    print(f"Wrote {args.output} ({args.output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
