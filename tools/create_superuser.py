import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from create_admin import create_admin


if __name__ == "__main__":
    raise SystemExit(0 if create_admin() else 1)
