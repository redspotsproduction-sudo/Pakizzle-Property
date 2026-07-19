.PHONY: install run lint format test clean

install:
	uv pip install -e ".[dev]" || pip install -e ".[dev]"

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-prod:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

lint:
	ruff check app

format:
	ruff format app
	ruff check --fix app

test:
	pytest -q

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	rm -rf .ruff_cache .pytest_cache build dist *.egg-info
