FROM deno:2.0

WORKDIR /app

COPY deno.json ./

RUN deno install

COPY src/ ./src/

EXPOSE 3001

CMD ["deno", "task", "start"]
