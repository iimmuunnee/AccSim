FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
COPY accsim/ accsim/

RUN pip install --no-cache-dir ".[web]"

EXPOSE 8080

CMD ["uvicorn", "accsim.web.app:app", "--host", "0.0.0.0", "--port", "8080"]
