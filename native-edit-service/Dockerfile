FROM node:20-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip qpdf \
  && python3 -m pip install --no-cache-dir --break-system-packages pikepdf \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8787
CMD ["node", "server.js"]
