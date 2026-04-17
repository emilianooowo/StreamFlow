FROM denoland/deno:2.7.12

WORKDIR /app

COPY deno.json ./

COPY src/ ./src/

USER deno

EXPOSE 3001

CMD ["task", "start"]
